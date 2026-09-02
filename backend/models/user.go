package models

import "gorm.io/gorm"

var (
	RoleJobSeeker uint = 0
	RoleRecruiter uint = 1
	RoleAdmin     uint = 2
)

type User struct {
	gorm.Model
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Role      uint `json:"role"`
	Age       uint   `json:"age"`
	Views     uint   `json:"views"`

	Login Login

	Skills    []Skill
	Locations []Location
	Sectors   []Sector
	Videos    []Video
}
