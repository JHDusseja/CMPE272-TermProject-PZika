
input <- read.csv(file = "x.csv", header = TRUE, sep = ",")
i <- kmeans(input, 10)
input$Risk <- i$cluster
write.table(input, file = "x.csv", sep = ",", col.names = NA,
            qmethod = "double")