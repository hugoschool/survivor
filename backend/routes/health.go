package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/hugoarnal/survivor/database"
)

const (
	Version string = "v1.0.0"
)

type healthResponse struct {
	Version  string `json:"version"`
	DBStatus string `json:"db_status"`
}

// Health godoc
// @Summary Health check
// @Schemes
// @Description Health check
// @Tags Utils
// @Accept json
// @Produce json
// @Success 200 {object} healthResponse
// @Success 503 {object} healthResponse
// @Router /health [get]
func HealthHandler(c *gin.Context) {
	status := http.StatusOK
	dbStatus := "Unavailable"

	db, err := database.DB.DB()

	if err == nil {
		err = db.Ping()
		if err != nil {
			status = http.StatusServiceUnavailable
		} else {
			dbStatus = "Available"
		}
	} else {
		status = http.StatusServiceUnavailable
	}

	c.JSON(status, healthResponse{Version: Version, DBStatus: dbStatus})
}
