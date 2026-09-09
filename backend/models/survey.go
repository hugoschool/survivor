package models

import "gorm.io/gorm"

type SurveyInput struct {
	ID        *uint `json:"id"`
	Questions []Question
}

type Survey struct {
	gorm.Model    `json:"model"`
	ObtentionRate uint       `json:"obtention_rate"`
	Questions     []Question `json:"questions"`
}
