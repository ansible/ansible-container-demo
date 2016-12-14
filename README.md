[![Build Status](https://travis-ci.org/ansible/ansible-container-demo.svg?branch=master)](https://travis-ci.org/ansible/ansible-container-demo)

# Ansible Container Demo

Ansible Container can manage the lifecycle of an application from development through cloud deployment. In this demo we'll create, test and deploy a new social media app called *Not Google Plus*. The application itself comes from a [tutorial](https://thinkster.io/django-angularjs-tutorial), but not to worry, this isn't a programming tutorial. Instead, we'll focus on how to use Ansible Container through each phase.  

## Requirements

Before continuing, you'll need a couple of things:

 - A Linux or OSX environment  
 - Ansible Container installed from source. See our [Running from source guide](http://docs.ansible.com/ansible-container/installation.html#running-from-source) for assistance.  
 - Docker Engine or Docker for Mac. See [Docker Installation](https://docs.docker.com/engine/installation/) for assistance.
 - [Ansible 2.1+](http://docs.ansible.com/ansible/intro_installation.html), if you plan to run the deployment

## Getting Started

Ansible roles can be used to initialize a new project or add services to existing projects. Roles are found on the [Ansible Galaxy](https://galaxy.ansible.com) web site, and there are two role types we can use with Ansible Container. The *container app* role contains a fully functioning app, and can be used to initialize an empty project. A *container enabled* role will add a service to an existing project, and it contains a Docker Compose service definition, a [playbook](http://docs.ansible.com/ansible/playbooks.html), and any files needed to build the container image.

We'll start by creating an empty project directory, and initializing it with the [ansible.django-gulp-nginx](https://galaxy.ansible.com/ansible/django-gulp-nginx) role. It's a *container app* role, providing a fully functioning Django framework. And because we're able to start with this role, the containerization and Django setup work is already done. All that's left is to add the source code for our new social media site, and we'll have a completed app. 

Create the project folder, and initialize it by opening a terminal session and running the following commands:

```
# Create an empty directory called 'demo'
$ mkdir demo

# Set the working directory to demo
$ cd demo

# Initialize the project
$ ansible-container init ansible.django-gulp-nginx
``` 

The following video shows the project init steps:

[![Project Init](https://raw.githubusercontent.com/ansible/ansible-container-demo/gh-pages/images/init.png)](https://youtu.be/1Qv2GeSjyiY)


You now have a copy the *ansible.django-gulp-nginx* framework project in your *demo* directory. Inside *demo/ansible* you'll find a `container.yml` file describing in [Compose](http://docs.ansible.com/ansible-container/container_yml/reference.html) the services that make up the application, and an Ansible playbook called `main.yml` containing a set of plays for building the application images.

### Build the Images

To start application development, we'll first need to build the images. Start the build process by running the following command:

```
# Start the image build process
$ ansible-container build
```

[![Build Images](https://raw.githubusercontent.com/ansible/ansible-container-demo/gh-pages/images/build.png)](https://youtu.be/xnzrNWHzFWY)

The build process launches a container for each service defined in `container.yml` along with a build container. For each service container, the base image is the image specified in `container.yml`. The build container runs the `main.yml` playbook, executing tasks on each of the service containers. When the playbook run completes, each image will be `committed`, creating a new set of images.

When the build completes, run the `docker images` command to view a list of local images. The output will include the following images:

```
# View the images
$ docker images

REPOSITORY                          TAG                 IMAGE ID            CREATED             SIZE
demo-django                         20161205170642      dbe68f4e3c74        About an hour ago   1.28 GB
demo-django                         latest              dbe68f4e3c74        About an hour ago   1.28 GB
demo-nginx                          20161205170642      5becc50f69a9        About an hour ago   270 MB
demo-nginx                          latest              5becc50f69a9        About an hour ago   270 MB
demo-gulp                           20161205170642      0644893c80d7        About an hour ago   508 MB
demo-gulp                           latest              0644893c80d7        About an hour ago   508 MB
```

### Run the Application

Now that you have the application images built in your environment, start the application by running the following:

```
# Start the application
$ ansible-container run
```
The containers are running in the foreground, with the output from each streaming in your terminal window. Open a browser, and go to [http://localhost:8080](http://localhost:8080), where you'll see the default "Hello World!" page.

### Development vs Production

The containers are currently running in *development*, which means that for each service the *dev_overrides* directive takes precedence. For example, take a look at the *gulp* service definition found in `container.yml`:

```
  gulp:
    image: centos:7
    user: '{{ NODE_USER }}'
    working_dir: '{{ NODE_HOME }}'
    command: ['/bin/false']
    environment:
      NODE_HOME: '{{ NODE_HOME }}'
    volumes:
      - "${PWD}:{{ NODE_HOME }}"
    dev_overrides:
      command: [/usr/bin/dumb-init, /usr/bin/gulp]
      ports:
      - 8080:{{ GULP_DEV_PORT }}
      - 3001:3001
      links:
      - django
    options:
      kube:
        state: absent
      openshift:
        state: absent
```

In development, *dev_overrides* takes precedence, so the command `/usr/bin/dumb-init /usr/bin/gulp` will be executed, ports `8080` and `3001` will be exposed, and the container will be linked to the *django* service container.

The application can be started in production mode, by running `ansible-container run --production`. In production the *dev_overrides* directive is completely ignored, which means the `/bin/false` command is executed, causing the container to immediately stop. No ports are exposed, and the container is not linked to the *django* service.

Since the frontend tools provided by the *gulp* service are only needed during development and not during production, we use *dev_overrides* to manage when the container runs.

The same is true for the *nginx* service. Take a look at the service definition in `container.yml`, and you'll notice it's configured opposite of the *gulp* service:

```
  nginx:
    image: centos:7
    ports:
    - {{ DJANGO_PORT }}:8000
    user: nginx
    links:
    - django
    command: ['/usr/bin/dumb-init', 'nginx', '-c', '/etc/nginx/nginx.conf']
    dev_overrides:
      ports: []
      command: /bin/false
    options:
      kube:
        runAsUser: 1000
```

In development the *nginx* service runs the `/bin/false` command, and immediately exits. But in production, it starts the *nginx* process, and takes the place of the *gulp* service as the application's web server.

### Developing the Application

Let's make some updates and create the *Not Google Plus* app, and then we'll see how to test and deploy it. To make the changes, start by opening a second terminal window. In the second window run the following commands to download the source, and update the project:

```
# Set the working directory to your *demo* folder
$ cd demo

# Stop the application (the containers are still running in the first window)
$ ansible-container stop

# Download and expand the source archive
$ curl -L https://github.com/ansible/ansible-container-demo/archive/v0.1.0.tar.gz | tar -xzv

# Copy the frontend files
$ cp -R ansible-container-demo-0.1.0/src/* src

# Copy the Django files
$ cp -R ansible-container-demo-0.1.0/project/* project

# Restart the application
$ ansible-container run
```

The *Not Google Plus* application is now running. If you take a look at your browser, and once again go to [http://localhost:8080](http://localhost:8080), you'll see that the "Hello World!" page has been replaced by our social media site.

### Tour the Site 

Let's check out *Not Google Plus*. Watch the video below, and follow along on your local site to register, log in, and create posts. Your site will be reachable at [http://localhost:8080](http://localhost:8080), and you can browse the API directly at [http://localhost:8080/api/v1/](http://localhost:8080/api/v1/).

Click the image below to watch a video tour of the site:

[![Site Tour](https://raw.githubusercontent.com/ansible/ansible-container-demo/gh-pages/images/demo.png)](https://youtu.be/XVOIVhcYd8M)

### Stopping the Containers

Once you're finished, you can press `control-c` or `ctrl-c` to kill the containers. This will signal Docker to kill the processes running inside the containers, and shut the containers down. This works when the containers are running in the foreground, streaming output to your terminal window.

You can also run `ansible-container stop`, as you did earlier, by opening a second terminal window, setting the working directory to your *demo* folder, and running the command. The `stop` command will terminate all containers associated with the project, regardless of whether they're running in the foreground or in the background.

## Testing

Now that you made changes to the application by adding the code for *Not Google Plus*, you'll need to build a new set of images containing the updated source code before testing and deploying.

Start the build process by running the following command:

```
# Start the build process
$ ansible-container build
```  

Once the build process completes, take a look at your local images using `docker images`:

```
# View the images once again
$ docker images

REPOSITORY                          TAG                 IMAGE ID            CREATED             SIZE
demo-django                         20161205192107      103a28329385        4 minutes ago       2.31 GB
demo-django                         latest              103a28329385        4 minutes ago       2.31 GB
demo-gulp                           20161205192107      b264122208b5        5 minutes ago       534 MB
demo-gulp                           latest              b264122208b5        5 minutes ago       534 MB
demo-nginx                          20161205192107      7206eff9bf9b        5 minutes ago       295 MB
demo-nginx                          latest              7206eff9bf9b        5 minutes ago       295 MB
demo-django                         20161205170642      dbe68f4e3c74        2 hours ago         1.28 GB
demo-nginx                          20161205170642      5becc50f69a9        2 hours ago         270 MB
demo-gulp                           20161205170642      0644893c80d7        2 hours ago         508 MB
```

You now have a newer set of images with the updated code baked into the *nginx* and *django* images, and when you deploy the application to production, you'll be deploying the *Not Google Plus* app.

For testing, we want the application in *production mode*, so that it runs exactly the same as it will when deployed to the cloud. As we pointed out earlier, when run in production the *dev_overrides* settings are ignored, which means we'll see the *gulp* service stop and the *nginx* service start and run as our web server.

To start the application in production mode, run the following command:

```
# Start the application with the production option
$ ansible-container run --production
```

If we were running a CI/CD process, this is the point where we would run our automated testing scripts. In lieu of that, open a browser, and once again go to [http://localhost:8080](http://localhost:8080) to confirm the site is working as expected. 

Click the image below to watch a video of the application starting with the ``--production`` option:

[![Testing](https://raw.githubusercontent.com/ansible/ansible-container-demo/gh-pages/images/production.png)](https://youtu.be/ATpYJhG1RV0)

## Deploy the application

Once the application passes testing, it's time to deploy it to production. To demonstrate, we'll create a local instance of OpenShift, push images to its registry, and generate and run a deployment.

### Create a local OpenShift instance

To create an OpenShift instance you'll install the ``oc`` command line tool, and then run `oc cluster up` to create an instance running in containers.

You'll find instructions in our [Install and Configure OpenShift guide](http://docs.ansible.com/ansible-container/configure_openshift.html) to help you create an instance. One available installation method is the Ansible role [chouseknecht.cluster-up-role](https://galaxy.ansible.com/chouseknecht/cluster-up-role), which is demonstrated in the following video:

[![Creating an OpenShift instance](https://raw.githubusercontent.com/ansible/ansible-container-demo/gh-pages/images/cluster.png)](https://youtu.be/iY4bkHDaxCc)

To use the role, you'll need Ansible installed. Also, note in the video that the playbook is copied from the installed role's file structure. You'll find the playbook, *cluster-up.yml*, in the *files* subfolder.

As noted in the role's [README](https://github.com/chouseknecht/cluster-up-role/blob/master/README.md), if you have not already added the *insecure-registry* option to Docker, the role will error, and provide the subnet or IP range that needs to be added. You'll also need to add the value of the *openshift_hostname* option, which by default is *local.openshift*. For more about adding the --insecure-registry option see [Docker's documentation](https://docs.docker.com/registry/insecure/). 

### Create an OpenShift project

Now that you have an OpenShift instance, run the following to make sure you're logged into the cluster as *developer*, and create a *demo* project:

```
# Verify that we're logged in as the *developer* user
$ oc whoami
developer

# Create a demo project
$ oc new-project demo

Now using project "demo" on server "https://...:8443".

You can add applications to this project with the 'new-app' command. For example, try:

    oc new-app centos/ruby-22-centos7~https://github.com/openshift/ruby-ex.git

to build a new example application in Ruby.
```

### Push the images

Before starting the application on the cluster, the images will need to be accessible, so you'll push them to the *demo* repository on the local registry.

If you ran the role to create the OpenShift instance or worked through our guide, then a new hostname, *local.openshift*, was created for accessing the registry, and the *developer* account now has full admin access. You'll employ both as you execute the following commands to push the images:   

```
# Set the working directory to the demo project
$ cd demo

# Push the demo images to the local registry 
$ ansible-container push --push-to https://local.openshift/demo --username developer --password $(oc whoami -t)
```

The following video shows the project's images being pushed to the local registry:

[![Push images](https://raw.githubusercontent.com/ansible/ansible-container-demo/gh-pages/images/push.png)](https://youtu.be/KklXsFKd8gQ)

### Generate the deployment artifacts 

Now you'll generate a playbook and role that are capable of deploying the application. From the *demo* directory, execute the `shipit` command as pictured below, passing the `--pull-from` option with the URL to the local registry:

```
# Generate the deployment playbook and role
$ ansible-container shipit openshift --pull-from https://local.openshift/demo
```
Running the above creates, a playbook, *shipit-openshift.yml*, in the *ansible* directory, and a role, *demo-openshift*, in the *ansible/roles* directory as demonstrated in the following video:

[![Run shipit](https://raw.githubusercontent.com/ansible/ansible-container-demo/gh-pages/images/shipit.png)](https://youtu.be/4a8WKO5Kjlo)

### Deploy!

You now have the deployment playbook and role. But before you run the playbook, you'll need to create an inventory file. If you're not familiar with Ansible, not to worry. A playbook runs a set of plays on a list of hosts, and the inventory file holds the list of hosts. In this case we want to execute the plays on our local workstation, which we can refer to as *localhost*, and so we'll create an inventory file containing a single host named *localhost*. Run the following to create the inventory file:

```
# Set the working directory to demo/ansible
$ cd ansible

# Create an inventory file
$ echo "localhost">inventory
```
Now from inside the *demo/ansible* directory, run the following to launch the *Not Google Plus* site on your OpenShift instance:

```
# Run the playbook
$ ansible-playbook -i inventory shipit-openshift.yml
```
Once the playbook completes, the application will be running on the cluster, and you can log into the console to take a look. To access the application, you'll need the hostname assigned to the route, and you can discover that by clicking on *Applications*, and choosing *Routes*. From there click on the hostname link, and the application will be opened in a new browser tab.

Watch the following video to see the full deployment:  

[![Deploy the app](https://raw.githubusercontent.com/ansible/ansible-container-demo/gh-pages/images/deploy.png)](https://youtu.be/9i6iGMLyr44)
