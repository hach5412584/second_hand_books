package router

import (
	"github.com/gorilla/mux"
	"github.com/hach5412584/second_hand_books/pkg/handlers"
)

func InitRouter() *mux.Router {
	r := mux.NewRouter()

	// User routes
	r.HandleFunc("/api/register", handlers.Register).Methods("POST")
	r.HandleFunc("/api/login", handlers.Login).Methods("POST")

	// Book routes
	r.HandleFunc("/api/books", handlers.CreateBook).Methods("POST")
	r.HandleFunc("/api/booklist", handlers.GetBooks_list).Methods("GET")
	r.HandleFunc("/api/allbooks", handlers.GetBooks_all).Methods("GET")
	r.HandleFunc("/api/booksDetails", handlers.GetBooks_Details).Methods("GET")

	// Categories routes
	r.HandleFunc("/api/categories", handlers.GetCategories).Methods("GET")
	r.HandleFunc("/api/Quicksearch", handlers.GetBooksByCategory).Methods("GET")

	//cart routes
	r.HandleFunc("/api/cart", handlers.GetCartItems).Methods("GET")

	//chat
	r.HandleFunc("/api/chat/get", handlers.GetChatHistory).Methods("GET")
	r.HandleFunc("/api/chat/list", handlers.GetContactsHandler).Methods("GET")
	r.HandleFunc("/api/chat/send", handlers.SendChatMessage).Methods("POST")

	//transactions
	r.HandleFunc("/api/transactions", handlers.CreateTransaction).Methods("POST")
	r.HandleFunc("/api/purchaseHistory", handlers.GetPurchaseHistory).Methods("GET")

	return r
}
