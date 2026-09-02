package routes

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/hugoarnal/survivor/models"
	"gorm.io/gorm"
	"errors"
)

var (
    ErrQuestionNotFound    = errors.New("Question not found")
    ErrResponsNotFound = errors.New("Respons not found")
)


func GetSurvey(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var survey models.Survey

		result := db.Preload("Questions.Answers").First(&survey, 1)

		if result.Error != nil {
			if result.Error == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "Survey not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}

		c.JSON(http.StatusOK, survey)
	}
}
