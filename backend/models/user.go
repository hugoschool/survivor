package models

import "gorm.io/gorm"

var (
	RoleJobSeeker uint = 0
	RoleRecruiter uint = 1
	RoleAdmin     uint = 2
)

type User struct {
	gorm.Model
	FirstName string
	Lastname  string
	Role      uint
	Age       uint
	Views     uint

	Login Login

	Skills    []Skill
	Locations []Location
	Sectors   []Sector
	Videos    []Video
}
