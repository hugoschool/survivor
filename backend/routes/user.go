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

const (
	UsersPageSize int = 20
)

var (
	ErrSkillNotFound    = errors.New("skill not found")
	ErrLocationNotFound = errors.New("location not found")
	ErrSectorNotFound   = errors.New("sector not found")
	ErrVideoNotFound    = errors.New("video not found")
)

// UserGetId godoc
// @Summary Get a singular user
// @Schemes
// @Description Get a singular user
// @Tags Users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} models.User
// @Failure 400 {object} models.ApiError
// @Failure 401 {object} models.ApiError
// @Failure 404 {object} models.ApiError
// @Failure 500 {object} models.ApiError
// @Router /users/:id [get]
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
			c.JSON(http.StatusNotFound, models.ApiError{Message: "User not found"})
			return
		} else {
			c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
			return
		}
	}

	c.JSON(http.StatusOK, user)
}

func Paginate(page int) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if page <= 0 {
			page = 1
		}
		offset := (page - 1) * UsersPageSize
		return db.Offset(offset).Limit(UsersPageSize)
	}
}

// UsersGet godoc
// @Summary Get all users (paginated)
// @Schemes
// @Description Get all users (paginated)
// @Tags Users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param page query int true "Page"
// @Success 200 {object} []models.User
// @Failure 401 {object} models.ApiError
// @Failure 500 {object} models.ApiError
// @Router /users [get]
func UsersPaginatedHandler(c *gin.Context) {
	var users []models.User
	page, _ := strconv.Atoi(c.Query("page"))

	err := database.DB.Scopes(Paginate(page)).Preload("Skills").
		Preload("Locations").
		Preload("Sectors").
		Preload("Videos").Find(&users).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
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

// UserUpdateId godoc
// @Summary Update a singular user
// @Schemes
// @Description Update a singular user
// @Tags Users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Param request body models.UserUpdateForm true "Request body"
// @Success 200 {object} models.User
// @Failure 400 {object} models.ApiError
// @Failure 401 {object} models.ApiError
// @Failure 404 {object} models.ApiError
// @Failure 500 {object} models.ApiError
// @Router /users/:id [put]
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
			c.JSON(http.StatusNotFound, models.ApiError{Message: "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	if err := c.ShouldBindJSON(&form); err != nil {
		c.JSON(http.StatusBadRequest, models.ApiError{Message: "Bad request"})
		return
	}

	if err := UpdateSkills(database.DB, &user, form.Skills); err != nil {
		if errors.Is(err, ErrSkillNotFound) {
			c.JSON(http.StatusNotFound, models.ApiMessage{Message: "Mismatch skills id"})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	if err := UpdateLocations(database.DB, &user, form.Locations); err != nil {
		if errors.Is(err, ErrLocationNotFound) {
			c.JSON(http.StatusNotFound, models.ApiMessage{Message: "Mismatch Location id"})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	if err := UpdateSectors(database.DB, &user, form.Sectors); err != nil {
		if errors.Is(err, ErrSectorNotFound) {
			c.JSON(http.StatusNotFound, models.ApiMessage{Message: "Mismatch Sector id"})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	if err := UpdateVideos(database.DB, &user, form.Videos); err != nil {
		if errors.Is(err, ErrVideoNotFound) {
			c.JSON(http.StatusNotFound, models.ApiMessage{Message: "Mismatch Video id"})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
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
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}
	c.JSON(http.StatusOK, user)
}

// UserDeleteId godoc
// @Summary Delete a singular user
// @Schemes
// @Description Delete a singular user
// @Tags Users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} models.ApiMessage
// @Failure 400 {object} models.ApiError
// @Failure 401 {object} models.ApiError
// @Failure 404 {object} models.ApiError
// @Failure 500 {object} models.ApiError
// @Router /users/:id [delete]
func UserDeleteHandler(c *gin.Context) {
	id := c.Param("id")
	var user models.User

	result := database.DB.First(&user, id)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, models.ApiError{Message: "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	err := database.DB.Select(clause.Associations).Delete(&user).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}
	c.JSON(http.StatusOK, models.ApiMessage{Message: "Success"})
}
