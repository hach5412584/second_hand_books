package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	ID        uint   `gorm:"primaryKey"`
	Username  string `gorm:"unique;not null"`
	Password  string `gorm:"not null"`
	Email     string `gorm:"unique;not null"`
	Phone     string `json:"phone"`
	Name      string `json:"name"`
	Address   string `json:"address"`
	Gender    string `json:"gender"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
	Books     []Book     `gorm:"foreignKey:UserID"`
}
