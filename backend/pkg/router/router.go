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
	r.HandleFunc("/api/cart/add", handlers.AddToCart).Methods("POST")
	r.HandleFunc("/api/cart", handlers.GetCartItems).Methods("GET")
	r.HandleFunc("/api/cart/delete/{itemID:[0-9]+}", handlers.DeleteCartItem).Methods("DELETE")
	r.HandleFunc("/api/cart/update/{itemID:[0-9]+}", handlers.UpdateCartItemQuantity).Methods("PUT")

	//chat
	r.HandleFunc("/api/chat/get", handlers.GetChatHistory).Methods("GET")
	r.HandleFunc("/api/chat/list", handlers.GetContactsHandler).Methods("GET")
	r.HandleFunc("/api/chat/send", handlers.SendChatMessage).Methods("POST")

	

	return r
}
