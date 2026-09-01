package models

import "gorm.io/gorm"

type Survey struct {
	gorm.Model    `json:"-"`
	ObtentionRate uint       `json:"obtention_rate"`
	Questions     []Question `json:"questions"`
}
