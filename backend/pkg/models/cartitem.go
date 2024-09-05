package models

import (

	"gorm.io/gorm"
)

type CartItem struct {
	gorm.Model
    ID     uint `gorm:"primaryKey"`
    UserID uint `gorm:"not null"`
    BookID uint `gorm:"not null"`
    Quantity int `gorm:"default:1"` // 可選：購物車中的書籍數量

    User User `gorm:"foreignKey:UserID"` // 關聯到 User 結構
    Book Book `gorm:"foreignKey:BookID"` // 關聯到 Book 結構
}