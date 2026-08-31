package models

import "gorm.io/gorm"

type Location struct {
	gorm.Model
	Loc string
}
