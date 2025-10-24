/// <binding BeforeBuild='publish' Clean='publish' />
//Gruntfile
'use strict';
module.exports = function (grunt) {

    //Initializing the configuration object
    grunt.initConfig({


        less:
        {
            debug:
            {
                options:
                {
                    compress: false,  //minifying the result
                    relativeUrls: true
                },
                files:
                {
                    "./Content/Styles/cireson.angularaside.min.css": "./Content/Styles/cireson.angularaside.less",
                    "./Content/Styles/cireson.main.min.css": "./Content/Styles/cireson.main.less",
                    "./Content/Styles/api.min.css": "./Content/Styles/api.less",
                    "./Content/Styles/login.min.css": "./Content/Styles/login.less",
                    "./Content/Styles/cireson.mentions-in-keditor.min.css": "./Content/Styles/cireson.mentions-in-keditor.less"
                }
            },
            publish: {
                files: {
                    "./Content/Styles/cireson.angularaside.min.css": "./Content/Styles/cireson.angularaside.less",
                    "./Content/Styles/api.min.css": "./Content/Styles/api.less",
                    "./Content/Styles/login.min.css": "./Content/Styles/login.less",
                    "./Content/Styles/cireson.mentions-in-keditor.min.css": "./Content/Styles/cireson.mentions-in-keditor.less"
                },
                options: {
                    compress: true,
                    relativeUrls: true,
                    javascriptEnabled: true
                }
            },
            prepublish: {
                files: {
                    "./Content/Styles/cireson.main.css": "./Content/Styles/cireson.main.less",
                },
                options: {
                    compress: false,
                    relativeUrls: true,
                    javascriptEnabled: true
                }
            }

        },
        comments: {
            publish: {
                options: {
                    singleline: true,
                    multiline: true,
                    keepSpecialComments: false
                },
                src: ['./Content/Styles/cireson.main.css'] // files to remove comments from 
            },
        },
        cssmin: {
            minify: {
                expand: true,
                cwd: './Content/Styles/',
                src: ['cireson.main.css'],
                dest: './Content/Styles/',
                ext: '.main.min.css'
            }
        },
        uglify: {
            min: {
                files: {
                    'Scripts/libs/perfect-scrollbar-override.with-mousewheel.min.js': [
                        'Scripts/libs/perfect-scrollbar-override.js',
                        'Scripts/libs/jquery.mousewheel.js'
                    ]
                }
            }
        },
        /*
        retire: {
            //node: ['Scripts/*'],
            js: ['Scripts/kendo/2018.1.117/jquery.min.js', 'Scripts/libs/jquery.easing.1.3.min.js', 'Scripts/libs/perfect-scrollbar-override.with-mousewheel.min.js',
                 'Scripts/libs/bootstrap.min.js', 'Scripts/libs/underscore.js', 'Scripts/libs/store2.min.js', 'Scripts/libs/moment_locales.min.js', 'Scripts/libs/PageTitleNotification.min.js',
                 'Scripts/libs/jquery.caret.js', 'Scripts/libs/jquery.atwho.js', 'Scripts/kendo/2018.1.117/jszip.min.js', 'Scripts/kendo/2018.1.117/kendo.all.min.js',
                 'Scripts/kendo/2018.1.117/kendo.angular.min.js', 'Scripts/kendo/2018.1.117/kendo.aspnetmvc.min.js', 'Scripts/kendo/kendo.web.ext.js', 'Scripts/libs/globalize.js',
                 'Scripts/app/app.js', 'Scripts/app/app.constants.js', 'Scripts/app/app.lib.js', 'Scripts/app/app.dataModels.js', 'Scripts/app/app.controls.js', '/CustomSpace/custom.js',
                 'Scripts/widgets/custom-bindings.js', 'Scripts/kendo/kendo.modernizr.custom.js', 'Scripts/libs/angular/angular.min.js', 'Scripts/ng/slideout-nav/app.js',
                 'Views/**', 'Scripts/Administration/**', 'Scripts/app/**', 'Scripts/assetManagement/**', 'Scripts/forms/**', 'Scripts/grids/**', 'Scripts/ng/**', 'Scripts/structure/**', 'Scripts/viewPanels/**', 'Scripts/views/**', 'Scripts/widgets/**',
                 'Scripts/viewBuilder.js', 'Scripts/drawerBuilder.js', 'Scripts/viewMain.js', 'Scripts/require.js', 'Controllers/**', 'Areas/**'],
            options: {
                verbose: true,
                packageOnly: true,
                jsRepository: 'https://raw.github.com/RetireJS/retire.js/master/repository/jsrepository.json',
                nodeRepository: 'https://raw.github.com/RetireJS/retire.js/master/repository/npmrepository.json',
                outputFile: './retire-output.json'
            }
        }
        */
    });

    // Plugin loading
    //grunt.loadNpmTasks('grunt-contrib-concat');
    //grunt.loadNpmTasks('grunt-contrib-clean');
    //grunt.loadNpmTasks('grunt-contrib-connect');
    //grunt.loadNpmTasks('grunt-contrib-copy');
    //grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-stripcomments');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    //grunt.loadNpmTasks('grunt-retire');


    

    // Task definition
    grunt.registerTask('debug', [
        'less:debug'
    ]);

    grunt.registerTask('publish', [
        'less:prepublish',
        'less:publish',
        'comments:publish',
        'cssmin:minify',
        'uglify'
    ]);
};