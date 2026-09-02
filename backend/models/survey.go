package models

import "gorm.io/gorm"

type SurveyInput struct {
	ID      *uint   `json:"id"`
	Questions []Question
}

type Survey struct {
	gorm.Model
	Questions     []Question
}
