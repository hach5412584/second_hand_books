package models

import (
	"time"

	"gorm.io/gorm"
)

type ChatMessage struct {
	gorm.Model
	ID         uint `gorm:"primarykey"`
	CreatedAt  time.Time
	UpdatedAt  time.Time
	SenderID   string
	ReceiverID string
	Message    string
	Timestamp  time.Time
}
