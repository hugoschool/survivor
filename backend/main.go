package main

import (
	"github.com/gin-gonic/gin"
	"github.com/hugoarnal/survivor/routes"
)

func main() {
	router := gin.Default()

	router.GET("/ping", routes.PingHandler())

	err := router.Run(":8080")
	if err != nil {
		panic(err)
	}
}
