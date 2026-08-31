package main

import (
	"github.com/gin-gonic/gin"
	"github.com/hugoarnal/survivor/database"
	"github.com/hugoarnal/survivor/routes"
)

func main() {
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
