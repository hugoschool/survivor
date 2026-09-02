package models

type SkillInput struct {
	ID      *uint   `json:"id"`
	Content *string `json:"content"`
}

type LocationInput struct {
	ID      *uint   `json:"id"`
	Content *string `json:"content"`
}

type SectorInput struct {
	ID      *uint   `json:"id"`
	Content *string `json:"content"`
}

type VideoInput struct {
	ID      *uint   `json:"id"`
	Content *string `json:"content"`
}


type UpdateForm struct {
	FirstName *string `json:"first_name"`
	LastName  *string `json:"last_name"`
	Role      *uint `json:"role"`
	Age       *uint `json:"age"`
	Skills    []SkillInput
	Locations []LocationInput
	Sectors   []SectorInput
	Videos    []VideoInput
}