package models

import "gorm.io/gorm"

type Answer struct {
	gorm.Model `json:"-"`
	QuestionID uint
	Answer     string `json:"answer"`
	Correct    bool `json:"-"`
}
