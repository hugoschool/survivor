package models

import "gorm.io/gorm"

type Video struct {
	gorm.Model `json:"model"`
	UserID     uint   `json:"user_id"`
	Link       string `json:"link"`
}
