package main

import (
	"os"

	"github.com/gin-gonic/gin"
	"github.com/hugoarnal/survivor/database"
	"github.com/hugoarnal/survivor/middlewares"
	"github.com/hugoarnal/survivor/routes"

	cors "github.com/gin-contrib/cors"
	_ "github.com/hugoarnal/survivor/docs"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {
	if os.Getenv("JWT_SECRET") == "" {
		panic("JWT_SECRET not found")
	}

	router := gin.Default()

	// TODO: change this for a proper CORS config asap
	router.Use(cors.Default())

	database.Connect()
	database.Migrate()

	account := router.Group("/account")
	account.POST("/login", routes.LoginHandler)
	account.POST("/register", routes.RegisterHandler)

	router.GET("/ping", routes.PingHandler)
	router.GET("/users/:id", routes.GetUser(database.DB))
	router.GET("/users", routes.GetAllUser(database.DB))
	router.PUT("/users/:id", routes.UpdateUser(database.DB))
	router.DELETE("/users/:id", routes.DeleteUser(database.DB))
	router.GET("/survey", routes.GetSurvey(database.DB))

	router.GET("/ping/auth", middlewares.AuthMiddleware, routes.PingHandler)
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	err := router.Run(":8080")
	if err != nil {
		panic(err)
	}
}
