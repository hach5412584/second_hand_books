package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/rs/cors"

	"github.com/hach5412584/second_hand_books/pkg/config"
	"github.com/hach5412584/second_hand_books/pkg/handlers"
	"github.com/hach5412584/second_hand_books/pkg/models"
	"github.com/hach5412584/second_hand_books/pkg/router"

	"github.com/sirupsen/logrus"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func initDB() {
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		config.Cfg.DBHost, config.Cfg.DBPort, config.Cfg.DBUser, config.Cfg.DBPassword, config.Cfg.DBName)
	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.Book{}, &models.ChatMessage{}, &models.Transaction{}); err != nil {
		log.Fatalf("Failed to auto-migrate User model: %v", err)
	}
	handlers.SetDB(db)
}

func main() {
	config.InitConfig()
	initDB()

	r := router.InitRouter()

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // Allow your frontend origin
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           int(12 * time.Hour / time.Second),
	})

	handler := c.Handler(r)

	logrus.Info("Starting server on :8080")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
