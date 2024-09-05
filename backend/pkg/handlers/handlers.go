package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gorilla/mux"
	"github.com/hach5412584/second_hand_books/pkg/models"
	"github.com/hach5412584/second_hand_books/pkg/utils"
	"golang.org/x/crypto/bcrypt"

	"gorm.io/gorm"
)

var db *gorm.DB

func SetDB(database *gorm.DB) {
	db = database
}

func Register(w http.ResponseWriter, r *http.Request) {
	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Password hashing failed")
		return
	}
	user.Password = string(hashedPassword)

	if err := db.Create(&user).Error; err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	utils.RespondWithJSON(w, http.StatusCreated, user)
}

func Login(w http.ResponseWriter, r *http.Request) {
	var loginReq struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&loginReq); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "无效的请求内容")
		return
	}

	var user models.User
	if err := db.Where("Email = ?", loginReq.Email).First(&user).Error; err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "用户名或密码错误")
		return
	}

	// 验证密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginReq.Password)); err != nil {
		utils.RespondWithError(w, http.StatusUnauthorized, "用户名或密码错误")
		return
	}

	// 登录成功，返回用户信息（排除密码等敏感信息）
	responseUser := models.User{
		ID:       user.ID,
		Username: user.Username,
		Phone:    user.Phone,
		Name:     user.Name,
		Address:  user.Address,
		Gender:   user.Gender,
		Email:    user.Email,
	}

	utils.RespondWithJSON(w, http.StatusOK, responseUser)
}

func CreateBook(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(10 << 20) // 10 MB
	if err != nil {
		http.Error(w, "Error parsing form data", http.StatusBadRequest)
		return
	}

	isbn := r.FormValue("isbn")
	title := r.FormValue("title")
	priceStr := r.FormValue("price")
	summary := r.FormValue("summary")
	category := r.FormValue("category")
	subcategory := r.FormValue("subcategory")
	author := r.FormValue("author")
	userIDstr := r.FormValue("userID")

	userID, err := strconv.ParseUint(userIDstr, 10, 32)
	if err != nil {
		http.Error(w, "Invalid userID format", http.StatusBadRequest)
		return
	}

	userIDUint := uint(userID)

	publicationDate := time.Now().In(time.FixedZone("GMT+8", 8*3600))

	price, err := strconv.ParseFloat(priceStr, 64)
	if err != nil {
		http.Error(w, "Invalid price format", http.StatusBadRequest)
		return
	}

	file, _, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Failed to get image file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	ctx := context.Background()
	cld, _ := cloudinary.NewFromParams("dicf1t1in", "244396539217266", "KSEp4v-IfF03bPtLmTI96oLYYso")
	uploadResult, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{})
	if err != nil {
		http.Error(w, "Failed to upload image", http.StatusInternalServerError)
		return
	}

	book := models.Book{
		ISBN:            isbn,
		Title:           title,
		Price:           price,
		Summary:         summary,
		Category:        category,
		Subcategory:     subcategory,
		Author:          author,
		PublicationDate: publicationDate,
		ImageURL:        uploadResult.SecureURL,
		UserID:          userIDUint,
	}

	result := db.Create(&book)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(book)
}

func GetCategories(w http.ResponseWriter, r *http.Request) {
	categories := map[string][]string{
		"哲學類":     {"哲學總論", "思想；學術", "中國哲學", "東方哲學", "西洋哲學", "邏輯學", "形上學", "心理學", "美學", "倫理學"},
		"宗教類":     {"宗教總論", "宗教學", "佛教", "道教", "基督教", "伊斯蘭教", "猶太教", "其他宗教", "神話", "術數；迷信"},
		"科學類":     {"科學總論", "數學", "天文學", "物理學", "化學", "地球科學；地質學", "生物科學", "植物學", "動物學", "人類學"},
		"應用科學類":   {"應用科學總論", "醫藥", "家政", "農業", "工程", "礦冶", "化學工程", "製造", "商業：各種營業", "商業：經營學"},
		"社會科學類":   {"社會科學總論", "統計", "教育", "禮俗", "社會學", "經濟", "財政", "政治", "法律", "軍事"},
		"史地類":     {"史地總論"},
		"中國史地":    {"中國通史", "中國斷代史", "中國文化史", "中國外交史", "中國史料", "中國地理", "中國地方志", "中國地理類志", "中國遊記"},
		"世界史地":    {"世界史地", "海洋志", "亞洲史地", "歐洲史地", "美洲史地", "非洲史地", "大洋洲史地", "傳記", "文物考古"},
		"語言文學類":   {"語言學總論", "文學總論", "中國文學", "中國文學總集", "中國文學別集", "中國各種文學", "東方文學", "西洋文學", "其他各國文學", "新聞學"},
		"藝術類":     {"藝術總論", "音樂", "建築藝術", "雕塑", "繪畫；書法", "攝影；電腦藝術", "應用美術", "技藝", "戲劇", "遊藝及休閒活動"},
		"漫畫、輕小說類": {"異世界", "校園", "戀愛", "奇幻", "科幻", "神祕", "恐怖", "歷史", "推理", "熱血"},
		"外文":      {"英文", "西班牙語", "日語", "德語", "法語", "俄語", "葡萄牙語", "阿拉伯語", "韓語", "其他"},
	}

	utils.RespondWithJSON(w, http.StatusOK, categories)
}

func GetBooks_list(w http.ResponseWriter, r *http.Request) {
	// 從查詢參數中獲取 userID
	userID := r.URL.Query().Get("userID")

	if userID == "" {
		http.Error(w, "User ID is required", http.StatusBadRequest)
		return
	}

	var books []models.Book
	// 查詢對應 userID 的書籍
	if err := db.Where("user_id = ?", userID).Find(&books).Error; err != nil {
		http.Error(w, "Failed to fetch books", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(books)
}

func GetBooks_all(w http.ResponseWriter, r *http.Request) {
	var books []models.Book
	if err := db.Find(&books).Error; err != nil {
		http.Error(w, "Failed to fetch books", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(books)
}

func GetBooks_Details(w http.ResponseWriter, r *http.Request) {
	// 從查詢參數中獲取 userID
	bookID := r.URL.Query().Get("bookID")

	if bookID == "" {
		http.Error(w, "Book ID is required", http.StatusBadRequest)
		return
	}

	var book models.Book
	// 查詢對應 bookID 的書籍並預加載 User 資料
	if err := db.Preload("User").Where("id = ?", bookID).First(&book).Error; err != nil {
		http.Error(w, "Failed to fetch book", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(book)
}

// 添加書籍到購物車
func AddToCart(w http.ResponseWriter, r *http.Request) {
	var requestBody struct {
		BookID   uint `json:"bookID"`
		UserID   uint `json:"userID"`
		Quantity int  `json:"quantity"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid request Body ", http.StatusBadRequest)
		return
	}

	var cartItem models.CartItem
	if err := db.Where("user_id = ? AND book_id = ?", requestBody.UserID, requestBody.BookID).First(&cartItem).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// 如果购物车项不存在，则创建新项
			cartItem = models.CartItem{
				UserID:   requestBody.UserID,
				BookID:   requestBody.BookID,
				Quantity: requestBody.Quantity,
			}
			if err := db.Create(&cartItem).Error; err != nil {
				http.Error(w, "Failed to add item to cart", http.StatusInternalServerError)
				return
			}
		} else {
			http.Error(w, "Failed to check cart item", http.StatusInternalServerError)
			return
		}
	} else {
		// 如果购物车项已存在，则更新数量
		if err := db.Model(&cartItem).Update("quantity", cartItem.Quantity+requestBody.Quantity).Error; err != nil {
			http.Error(w, "Failed to update item quantity", http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusCreated)
}

// 獲取用戶購物車中的書籍
func GetCartItems(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("userID")
	if userID == "" {
		http.Error(w, "User ID is required", http.StatusUnauthorized)
		return
	}
	var cartItems []models.CartItem
	if err := db.Preload("Book").Where("user_id = ?", userID).Find(&cartItems).Error; err != nil {
		http.Error(w, "Failed to fetch cart items", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cartItems)
}

func DeleteCartItem(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	itemID, err := strconv.Atoi(vars["itemID"])
	if err != nil {
		http.Error(w, "Invalid item ID", http.StatusBadRequest)
		return
	}

	userID := r.URL.Query().Get("userID")
	if userID == "" {
		http.Error(w, "User ID is required", http.StatusUnauthorized)
		return
	}

	// 删除购物车项
	if err := db.Where("id = ? AND user_id = ?", itemID, userID).Delete(&models.CartItem{}).Error; err != nil {
		http.Error(w, "Failed to delete item", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// 更新购物车项数量的处理函数
func UpdateCartItemQuantity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	itemID, err := strconv.Atoi(vars["itemID"])
	if err != nil {
		http.Error(w, "Invalid item ID", http.StatusBadRequest)
		return
	}

	var requestBody struct {
		Quantity int `json:"quantity"`
	}

	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	userID := r.URL.Query().Get("userID")
	if userID == "" {
		http.Error(w, "User ID is required", http.StatusUnauthorized)
		return
	}

	// 更新购物车项数量
	if err := db.Model(&models.CartItem{}).Where("id = ? AND user_id = ?", itemID, userID).Update("quantity", requestBody.Quantity).Error; err != nil {
		http.Error(w, "Failed to update item quantity", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func GetBooksByCategory(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	subcategory := r.URL.Query().Get("subcategory")

	var books []models.Book
	query := db.Where("category = ?", category)
	if subcategory != "" {
		query = query.Where("subcategory = ?", subcategory)
	}

	if err := query.Find(&books).Error; err != nil {
		http.Error(w, "Failed to fetch books", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(books)
}

func GetChatHistory(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Only GET method is allowed", http.StatusMethodNotAllowed)
		return
	}

	// 獲取查詢參數中的 SenderID 和 ReceiverID
	senderID := r.URL.Query().Get("senderId")
	receiverID := r.URL.Query().Get("receiverId")

	if senderID == "" || receiverID == "" {
		http.Error(w, "SenderID and ReceiverID are required", http.StatusBadRequest)
		return
	}

	var messages []models.ChatMessage

	// 從資料庫查詢兩個使用者之間的所有訊息
	if err := db.Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)", senderID, receiverID, receiverID, senderID).
		Order("timestamp asc").
		Find(&messages).Error; err != nil {
		http.Error(w, "Failed to get chat history", http.StatusInternalServerError)
		return
	}

	// 將訊息轉換為 JSON 格式並返回
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

func SendChatMessage(w http.ResponseWriter, r *http.Request) {
	var message models.ChatMessage
	err := json.NewDecoder(r.Body).Decode(&message)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if err := db.Model(&models.ChatMessage{}).Create(&message).Error; err != nil {
		http.Error(w, "Failed to send Message", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(message)
}

func GetContactsHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("userId") // 從查詢參數中獲取當前用戶 ID

	var contacts []models.User
	if err := db.Raw(`
		SELECT DISTINCT u.Username 
        FROM users u 
        JOIN chat_messages m 
        ON (u.Username = m.sender_id OR u.Username = m.receiver_id) 
        WHERE (m.sender_id = ? OR m.receiver_id = ?) 
        AND u.Username != ?`, userID, userID, userID).Scan(&contacts).Error; err != nil {
		http.Error(w, "Failed to fetch contacts", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(contacts)
}
