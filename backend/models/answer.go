package models

import "gorm.io/gorm"

type Answer struct {
	gorm.Model `json:"model"`
	QuestionID uint   `json:"question_id"`
	Answer     string `json:"answer"`
	Correct    bool   `json:"correct"`
}
