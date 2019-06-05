#!groovy

@Library('blockr-jenkins-lib') _

String repo = 'blockr-validator'

Map settings = [
    sonar_key: 'blockr-validator',
    sonar_exclusions: '**/__tests__/**/*,**/**/index.ts,**/**/main.ts,**/injection/**/*',
    source_folder: 'src/',
    archive_folders: ['dist/']
]

tsDockerBuildAndPublish(repo, settings)