package routes

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/hugoarnal/survivor/database"
	"github.com/hugoarnal/survivor/models"
)

type videoPaginatedResponse struct {
	Video models.Video `json:"video"`
	User  models.User  `json:"user"`
}

// VideoPaginatedGet godoc
// @Summary Get a feed of videos
// @Schemes
// @Description Get a feed of videos
// @Tags Videos
// @Accept json
// @Produce json
// @Param page query int true "Page"
// @Success 200 {object} []videoPaginatedResponse
// @Failure 400 {object} models.ApiError
// @Failure 401 {object} models.ApiError
// @Failure 500 {object} models.ApiError
// @Router /videos [get]
func VideosPaginatedHandler(c *gin.Context) {
	var videos []models.Video
	page, _ := strconv.Atoi(c.Query("page"))

	err := database.DB.Scopes(database.Paginate(page, UsersPageSize)).Find(&videos).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
		return
	}

	var response []videoPaginatedResponse

	for _, video := range videos {
		user, err := database.GetSimpleUserById(video.UserID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, models.ApiErrorOccured)
			return
		}

		response = append(response, videoPaginatedResponse{
			Video: video,
			User:  user,
		})
	}

	c.JSON(http.StatusOK, response)
}
