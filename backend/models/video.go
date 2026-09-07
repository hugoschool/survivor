package models

import "gorm.io/gorm"

const (
	VideoStatusMissing            uint = 0
	VideoStatusValidated          uint = 1
	VideoStatusInTreatment        uint = 2
	VideoStatusAwaitingModeration uint = 3
	VideoStatusRefused            uint = 4
)

type VideoStatus uint

type VideoLink struct {
	ID   string `json:"id"`
	Link string `json:"link"`
}

type Video struct {
	gorm.Model   `json:"model"`
	UserID       uint        `json:"user_id"`
	VideoID      string      `json:"video_id"`
	Status       VideoStatus `json:"status"`
	StatusReason string      `json:"status_reason"`
}
