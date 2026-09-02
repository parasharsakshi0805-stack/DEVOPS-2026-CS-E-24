pipeline {
    agent any

    environment {
        // Pulls the credential you add in Jenkins (ID: mongo-uri) into MONGO_URI
        // Not strictly needed for the test suite below (it uses an in-memory Mongo),
        // but kept here for any future integration/e2e stages.
        MONGO_URI   = credentials('mongo-uri')
        JWT_SECRET  = credentials('jwt-secret')
    }

    tools {
        nodejs 'node20' // Configure this name under Manage Jenkins > Tools > NodeJS installations
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Run tests') {
            steps {
                sh 'npm test'
            }
        }
    }

    post {
        always {
            junit testResults: 'junit.xml', allowEmptyResults: true
        }
        failure {
            echo 'Tests failed - check the JUnit report and console output above.'
        }
    }
}