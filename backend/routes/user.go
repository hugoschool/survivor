package routes

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/hugoarnal/survivor/database"
	"github.com/hugoarnal/survivor/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var (
	ErrSkillNotFound    = errors.New("skill not found")
	ErrLocationNotFound = errors.New("location not found")
	ErrSectorNotFound   = errors.New("sector not found")
	ErrVideoNotFound    = errors.New("video not found")
)

func UserGetHandler(c *gin.Context) {
	id := c.Param("id")
	var user models.User

	result := database.DB.Preload("Skills").
		Preload("Locations").
		Preload("Sectors").
		Preload("Videos").
		First(&user, id)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

func Paginate(page int) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		pageSize := 20
		if page <= 0 {
			page = 1
		}
		offset := (page - 1) * pageSize
		return db.Offset(offset).Limit(pageSize)
	}
}

func UsersPaginatedHandler(c *gin.Context) {
	var users []models.User
	page, _ := strconv.Atoi(c.Query("page"))

	err := database.DB.Scopes(Paginate(page)).Preload("Skills").
		Preload("Locations").
		Preload("Sectors").
		Preload("Videos").Find(&users).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

func UpdateSkills(db *gorm.DB, user *models.User, input []models.UserSkillInput) error {
	for i := range input {
		input_skill_id := input[i].ID
		if input_skill_id != nil {
			found := false
			for j := 0; j < len(user.Skills); j++ {
				user_skill_id := user.Skills[j].ID
				if user_skill_id == *input_skill_id {
					if input[i].Content != nil {
						user.Skills[j].Content = *input[i].Content
						result2 := db.Save(&user.Skills[j])
						if result2.Error != nil {
							return result2.Error
						}
					}
					found = true
					break
				}
			}
			if !found {
				return ErrSkillNotFound
			}
		}
	}
	return nil
}

func UpdateLocations(db *gorm.DB, user *models.User, input []models.UserLocationInput) error {
	for i := range input {
		input_location_id := input[i].ID
		if input_location_id != nil {
			found := false
			for j := 0; j < len(user.Locations); j++ {
				user_location_id := user.Locations[j].ID
				if user_location_id == *input_location_id {
					if input[i].Content != nil {
						user.Locations[j].Content = *input[i].Content
						result2 := db.Save(&user.Locations[j])
						if result2.Error != nil {
							return result2.Error
						}
					}
					found = true
					break
				}

			}
			if !found {
				return ErrLocationNotFound
			}
		}
	}
	return nil
}

func UpdateSectors(db *gorm.DB, user *models.User, input []models.UserSectorInput) error {
	for i := range input {
		input_Sector_id := input[i].ID
		if input_Sector_id != nil {
			found := false
			for j := 0; j < len(user.Sectors); j++ {
				user_Sector_id := user.Sectors[j].ID
				if user_Sector_id == *input_Sector_id {
					if input[i].Content != nil {
						user.Sectors[j].Content = *input[i].Content
						result2 := db.Save(&user.Sectors[j])
						if result2.Error != nil {
							return result2.Error
						}
					}
					found = true
					break
				}

			}
			if !found {
				return ErrSectorNotFound
			}
		}
	}
	return nil
}

func UpdateVideos(db *gorm.DB, user *models.User, input []models.UserVideoInput) error {
	for i := range input {
		input_Video_id := input[i].ID
		if input_Video_id != nil {
			found := false
			for j := 0; j < len(user.Videos); j++ {
				user_Video_id := user.Videos[j].ID
				if user_Video_id == *input_Video_id {
					if input[i].Content != nil {
						user.Videos[j].Link = *input[i].Content
						result2 := db.Save(&user.Videos[j])
						if result2.Error != nil {
							return result2.Error
						}
					}
					found = true
					break
				}

			}
			if !found {
				return ErrVideoNotFound
			}
		}
	}
	return nil
}

func UserUpdateHandler(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	var form models.UserUpdateForm

	result := database.DB.Preload("Skills").
		Preload("Locations").
		Preload("Sectors").
		Preload("Videos").
		First(&user, id)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	err := c.ShouldBindJSON(&form)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := UpdateSkills(database.DB, &user, form.Skills); err != nil {
		if errors.Is(err, ErrSkillNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Mismatch skills id"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := UpdateLocations(database.DB, &user, form.Locations); err != nil {
		if errors.Is(err, ErrLocationNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Mismatch Location id"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := UpdateSectors(database.DB, &user, form.Sectors); err != nil {
		if errors.Is(err, ErrSectorNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Mismatch Sector id"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := UpdateVideos(database.DB, &user, form.Videos); err != nil {
		if errors.Is(err, ErrVideoNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Mismatch Video id"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if form.FirstName != nil {
		user.FirstName = *form.FirstName
	}

	if form.LastName != nil {
		user.LastName = *form.LastName
	}

	if form.Age != nil {
		user.Age = *form.Age
	}

	if form.Role != nil {
		user.Role = *form.Role
	}

	final_save := database.DB.Save(&user)
	if final_save.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": final_save.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, user)
}

func UserDeleteHandler(c *gin.Context) {
	id := c.Param("id")
	var user models.User

	result := database.DB.First(&user, id)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	err := database.DB.Select(clause.Associations).Delete(&user).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}
