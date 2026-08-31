package models

import "gorm.io/gorm"


type Competencie struct {
	gorm.Model
	CompID uint
	Comp   string
}
