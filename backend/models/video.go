package models

import "gorm.io/gorm"

type Video struct {
	gorm.Model
	UserID uint   `json:"user_id"`
	Link   string `json:"link"`
	Status uint   `json:"status"`
}
