package models

import (
	"time"

	"gorm.io/gorm"
)

type Book struct {
	ID              uint    `gorm:"primaryKey"`
	ISBN            string  `gorm:"not null"`
	Title           string  `gorm:"not null"`
	Price           float64 `gorm:"type:numeric(10,2);not null"`
	Summary         string
	Category        string `gorm:"not null"`
	Subcategory     string `gorm:"not null"`
	Author          string `gorm:"not null"`
	PublicationDate time.Time
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       gorm.DeletedAt `gorm:"index"`
	PublishDate     time.Time      `gorm:"not null"`
	ImageURL        string
	UserID          uint `gorm:"not null"` // UserID 應為 uint 類型
	User            User `gorm:"foreignKey:UserID"`
}
