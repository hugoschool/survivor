package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	UserID       uint
	FirstName    string
	Lastname     string
	Role         string
	Age          uint
	Views        uint
	Competencies []Competencie
	Locations    []Location
	Sectors      []Sector
	Videos       []Video
}

