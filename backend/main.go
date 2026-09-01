package main

import (
	"os"

	"github.com/gin-gonic/gin"
	"github.com/hugoarnal/survivor/database"
	"github.com/hugoarnal/survivor/routes"
)

func main() {
	if os.Getenv("JWT_SECRET") == "" {
		panic("JWT_SECRET not found")
	}

	router := gin.Default()

	database.Connect()
	database.Migrate()

	account := router.Group("/account")
	account.POST("/login", routes.LoginHandler)
	account.POST("/register", routes.RegisterHandler)

	router.GET("/ping", routes.PingHandler)

	err := router.Run(":8080")
	if err != nil {
		panic(err)
	}
}
