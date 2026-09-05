package models

import "gorm.io/gorm"

const (
	VideoStatusMissing uint = 0
	VideoStatusExists  uint = 1
)

type VideoStatus uint

type Video struct {
	gorm.Model `json:"model"`
	UserID     uint        `json:"user_id"`
	VideoID    string      `json:"video_id"`
	Status     VideoStatus `json:"status"`
}
