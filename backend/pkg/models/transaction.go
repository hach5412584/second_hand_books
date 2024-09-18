package models

import (
	"time"

	"gorm.io/gorm"
)

type Transaction struct {
	ID        uint           `gorm:"primaryKey"`
	BuyerID   uint           `gorm:"not null"`                           // 購買者ID
	SellerID  uint           `gorm:"not null"`                           // 賣家ID
	BookID    uint           `gorm:"not null"`                           // 書籍ID
	Amount    float64        `gorm:"type:decimal(10,2);not null"`        // 交易金額
	Quantity  uint           `gorm:"not null"`                           // 交易數量
	Status    string         `gorm:"type:varchar(20);default:'pending'"` // 交易狀態：pending, completed, failed
	CreatedAt time.Time      `gorm:"autoCreateTime"`                     // 建立時間
	UpdatedAt time.Time      `gorm:"autoUpdateTime"`                     // 更新時間
	Buyer     User           `gorm:"foreignKey:BuyerID;references:ID"`   // 明確指定參考關聯
	Seller    User           `gorm:"foreignKey:SellerID;references:ID"`  // 明確指定參考關聯
	Book      Book           `gorm:"foreignKey:BookID;references:ID"`    // 明確指定參考關聯
	DeletedAt gorm.DeletedAt `gorm:"index"`                              // 軟刪除欄位
}
