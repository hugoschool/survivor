package routes

import "github.com/gin-gonic/gin"

func LoginHandler(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "pong",
	})
}

func RegisterHandler(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "pong",
	})
}
