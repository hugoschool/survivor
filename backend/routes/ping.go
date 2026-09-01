package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/hugoarnal/survivor/models"
)

// Ping godoc
// @Summary ping
// @Schemes
// @Description Simply says pong
// @Tags Utils
// @Accept json
// @Produce json
// @Success 200 {object} models.ApiMessage
// @Router /ping [get]
func PingHandler(c *gin.Context) {
	c.JSON(http.StatusOK, models.ApiMessage{Message: "pong"})
}
