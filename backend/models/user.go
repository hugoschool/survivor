package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	FirstName string
	Lastname  string
	Role      string
	Age       uint
	Views     uint
	Skills    []Skill
	Locations []Location
	Sectors   []Sector
	Videos    []Video
}
