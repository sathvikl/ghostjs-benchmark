# ghostjs-benchmark
Node.js benchmark based upon Ghost.js

This benchmark is created from https://ghost.org/features/  
which is a platform for creating an online 
blog or a publication.

### Version
This version of the benchmark is based on ghost.js version v0.11.7

Consequently, based on ghost.js works it is compatible with node.js LTS versions >=6.9 <7.* and >=4.5 <5.*
More info is at [Supported Node.js versions](http://support.ghost.org/supported-node-versions/)

### Start up of ghost.js benchamark

Currently start-up and initialization of the database is not automated. 

1. create an account in the mysql database and copy the information to [config.js for Ghost](https://github.com/sathvikl/ghostjs-benchmark/blob/bb75aa9877ce8f425279d7ad434a18c8d391422e/ghostjs-repo/config.js#L28)

2. Import the contents from the mysql dump file [ghost-db-dump.txt](https://github.com/sathvikl/ghostjs-benchmark/blob/master/ghost-db-dump.txt) into the ghost_db database. 
```MYSQL Shell
CREATE DATABASE ghost_db;
```
Then log out of the MySQL shell and type the following on the command line:
```
mysql -u [username] -p ghost_db < ghost-db-dump.txt
```
With that, you have imported ghost_db benchmark database into your destination system's MySQL.

3. Install all the node modules onto your system
`cd` [ghostjs-repo](https://github.com/sathvikl/ghostjs-benchmark/tree/master/ghostjs-repo)
```
npm install 
```  

4. switch to a compatible version of Node.js and start the server  
For a single instance `NODE_ENV=production node index.js`  
For a cluster instance `NODE_ENV=production node cluster-index.js`  
  
`Listening on http://localhost:8013` :tada:

### Load test the server
You can use [ab apache bench](http://httpd.apache.org/docs/2.2/en/programs/ab.html), [Siege](https://github.com/JoeDog/siege) or wrk to load test the server.  

Available HTTP end-points are
* http://localhost:8013/how-to-take-a-picture-of-the-milky-way/  
* http://localhost:8013/what-are-the-optimal-spaced-repetition-time-intervals/  
* http://localhost:8013/new-world-record-with-apache-spark/   
Last end-point's content is copied from https://databricks.com/blog/2016/11/14/setting-new-world-record-apache-spark.html
  
On a Haswell 4-core Desktop CPU, Intel(R) Core(TM) i7-4790 CPU @ 3.60GHz 
delivers a RPS of 169 with ab 
```
ab -n 10000 -c 8 http://127.0.0.1:8013/new-world-record-with-apache-spark/
This is ApacheBench, Version 2.3 <$Revision: 1604373 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking 127.0.0.1 (be patient)
Completed 1000 requests
Completed 2000 requests
Completed 3000 requests
Completed 4000 requests
Completed 5000 requests
Completed 6000 requests
Completed 7000 requests
Completed 8000 requests
Completed 9000 requests
Completed 10000 requests
Finished 10000 requests


Server Software:        
Server Hostname:        127.0.0.1
Server Port:            8013

Document Path:          /new-world-record-with-apache-spark/
Document Length:        16972 bytes

Concurrency Level:      8
Time taken for tests:   59.043 seconds
Complete requests:      10000
Failed requests:        4
   (Connect: 0, Receive: 0, Length: 4, Exceptions: 0)
Total transferred:      172288968 bytes
HTML transferred:       169718968 bytes
Requests per second:    169.37 [#/sec] (mean)
Time per request:       47.235 [ms] (mean)
Time per request:       5.904 [ms] (mean, across all concurrent requests)
Transfer rate:          2849.62 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.0      0       1
Processing:    24   47  15.5     43     327
Waiting:       23   47  15.5     43     321
Total:         24   47  15.5     43     327

Percentage of the requests served within a certain time (ms)
  50%     43
  66%     46
  75%     48
  80%     50
  90%     61
  95%     73
  98%     93
  99%    105
 100%    327 (longest request)
```

