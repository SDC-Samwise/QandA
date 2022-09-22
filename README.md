# Questions and Answers Backend Microservice

Project Atelier is a backend microservice for an E-Commerce product detail page.  Specifically it's a microservice for the Questions and Answers portion of the project. The service was scaled in AWS EC2 to use an Nginx Load Balancing Server, 5 Host servers all communicating with a PostgreSQL database. It currently supports 925 clients per second with response latency of 149 ms (down from 1175 ms).

## PostgreSQL Details

### Step 1:
Benchmarking database: With and without Indexing performance for my one query

### Indexing:
\* **Without** indexing the database the query took 12.45 seconds

\* **With** indexing the database, the query took 0.077 seconds

![With Index](images/PGAdmin1.png)

### Bottomline

| Indexing | Time          |
| :---     | :----:        |
| Without  | 12.45 seconds |
| With     | 0.077 seconds |


## Step 2: Implementing Nginx Load Balancer with Round Robin algo around 5 host servers

In testing I configured 1 AWS EC2 instance of the backend.  I ran test on it and noticed it quickly failed as I increased traffic.

I then created an Amazon Machine Image of the EC2 instance and used AWS to create 4 more images using the AMI.

I configured a 6th EC2 instance running Nginx as a load balancer and retested with [loader.io](https://loader.io/).

### Summary of results

| Clients | Seconds | Error Rate |
| :---    | :---    | :----:     |
| 800     | 15      | 0%         |
| 900     | 15      | 0%         |
| 925     | 15      | 0%         |
| 930     | 15      | 1.2%       |

![loader_io](images/loader_io.png)

## Step 3: Change PostgreSQL handshake type from Client to Pool

In this project I expected to have multiple concurrent requests so I switched from Client to Pool because in Pool I needed to be able to re-use open client instances.  Which in turn reduced latency whenever a client could be reused.  Originally I used Client and found that with Client each handshake took time and overhead.

## Results:
Running [K6](https://k6.io/) locally with 1,000 virtual users (VUs) over the span of 15 seconds on 1 EC2 instance.

![K6-Pool](images/K6_Pool.png)
