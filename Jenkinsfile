#!groovy

@Library('blockr-jenkins-lib@BLO-83-test-stage') _

String repo = 'blockr-validator'

Map settings = [
    sonar_key: 'blockr-validator',
    source_folder: 'src/',
    archive_folders: ['dist/']
]

tsBuildAndPublish(repo, settings)