---
title: "S3 Website Using cf , Route 53 and Python Scripts"
date: 2018-01-27T18:42:13-05:00
draft: false
include_toc: true
---
<!--more-->

## Part 1 , Create S3 Website
________________________________________

### Install AWSCLI and Python 3.6 , boto3 , eclipse and Hugo
1. Install AWSCLI (https://aws.amazon.com/cli/)
2. Install Python 3 (https://www.python.org/downloads/)
3. Install boto3 , keep this site for handy reference (http://boto3.readthedocs.io/en/latest/guide/quickstart.html)
4. Install Eclipse (https://www.eclipse.org/oxygen/)
5. Python plugin (https://marketplace.eclipse.org/content/pydev-python-ide-eclipse)
6. Install AWS Toolkit for Eclipse (https://aws.amazon.com/eclipse/)
7. Install Hugo (https://gohugo.io/getting-started/quick-start/)

### Create IAM User
You probably have an amazon aws account. Login and select IAM. Create new IAM user with admin privileges and use aws configure in your system to configure the user in your system. Use the 

### New HUGO Site
Create a new hugo site using the below tutorial. 

[Hugo Quick Start](https://gohugo.io/getting-started/quick-start/)

### Register a New Domain Name
Using the AWS Console register a new domain name eg: 100awsprojects.com. Use the Route53 service and follow the Register Domain to get yourself and yourdomain.com. We will use that int the below steps. You can do this later , but at this point you should know your website base url for hugo config. `baseurl = "https://100awsprojects.com"`

### Create New S3 Bucket and Upload
Lets now create 2 new buckets , one to hold the website contents and the other to hold the logs
BUCKET_NAME variable will hold your bucket name , LOG_BUCKET_NAME variable will hold the log bucket name.Grant permissions to the LogDelivery group and enable logging for the cdn bucket in the logs bucket.
```
DOMAIN_NAME="yourdomain.com"
BUCKET_NAME = "{}-cdn".format(DOMAIN_NAME)
LOG_BUCKET_NAME = "{}-logs".format(BUCKET_NAME)
s3 = boto3.client('s3')
s3.create_bucket(Bucket=BUCKET_NAME)
s3.create_bucket(Bucket=LOG_BUCKET_NAME)

#Bucket Permissions and Logging
s3client = boto3.client('s3')
s3client.put_bucket_acl(Bucket=LOG_BUCKET_NAME,
    GrantReadACP='URI="http://acs.amazonaws.com/groups/s3/LogDelivery"',
    GrantWrite='URI="http://acs.amazonaws.com/groups/s3/LogDelivery"')

s3client.put_bucket_logging(Bucket=BUCKET_NAME,
    BucketLoggingStatus={
        'LoggingEnabled': {
            'TargetBucket': LOG_BUCKET_NAME,
            'TargetPrefix': BUCKET_NAME
        }
    }
)
```
[read more ...](https://docs.aws.amazon.com/AmazonS3/latest/dev/website-hosting-custom-domain-walkthrough.html)

### Update the S3 Bucket to be a Website - put_bucket_website API
Get a handle to the boto s3 client and use the put bucket website to set the error , index and routing rules.
```
s3client = boto3.client('s3')
response = s3client.put_bucket_website(Bucket=BUCKET_NAME,
 WebsiteConfiguration={
        'ErrorDocument': {
            'Key': '404.html'
        },
        'IndexDocument': {
            'Suffix': 'index.html'
        },
        'RoutingRules': [
            {
                'Condition': {
                    'KeyPrefixEquals': '/'
                },
                'Redirect': {
                    'ReplaceKeyWith': 'index.html'
                }
            },
        ]
    }
)
```

### Upload your new HUGO Site to S3
Use the `hugo` command from the comand line build the final static website. Hugo generates all the static files under the /public directory of your project folder.
[read more...](https://gohugo.io/commands/hugo/)
here is a function to upload. Please call this function in your code.
```
target_site = "<path to your project dir>\\public";
upload_directory(target_site, BUCKET_NAME);

exclude_dir = set(['.git', '.gitmodules', '.idea'])
def upload_directory(src_dir, bucket_name):
    if not os.path.isdir(src_dir):
        raise ValueError('src_dir %r not found.' % src_dir)
    all_files = []
    for root, dirs, files in os.walk(src_dir):
        dirs[:] = [d for d in dirs if d not in exclude_dir]
        all_files += [os.path.join(root, f) for f in files]
    
    s3_resource = boto3.resource('s3')
    for filename in all_files:
        path_to_obj = os.path.relpath(filename, src_dir).replace("\\", "/")
        print(path_to_obj)
        s3_resource.Object(bucket_name, path_to_obj)\
        .put(ACL='public-read',
            ContentType='',
            ServerSideEncryption='AES256',
            Body=open(filename, 'rb'))
```

At this point you can test your website to make sure its accessable using the S3 website link.
`<bucket-name>.s3-website.<AWS-region>.amazonaws.com`

## Part 2 , Enable your new Domain to work
________________________________________

### Create New Certificates for your Website ( FREE !! )

```
DOMAIN_NAME="yourdomain.com"
acm_client = boto3.client('acm')
response = acm_client.request_certificate(
    DomainName= DOMAIN_NAME,
    ValidationMethod='DNS',
    SubjectAlternativeNames=[
        "www.{}".format(DOMAIN_NAME),
    ],
    IdempotencyToken='91adc45q'
)
```
After this step get into the console and hit on `<create record in route 53>` button , if the domain name is validated and ready.
Make a note of the certificate arns for our python variable SSL_ARN


### Create Cloudfront Distribution for your S3 Website
[Read more about cloudfront here](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-web-creating-console.html)

* Use the below lines of code to generate your version of Distribution config to be used with the Cloudfront API. Download the distribution config template file : [cloudfront.json](/supporting_files/2018-01-27-s3-cf-website/cloudfront.json)
`distribution_config_template = Template(open("cloudfront.json", 'r').read())
distribution_config = distribution_config_template.substitute(SSL_ARN=SSL_ARN, DOMAIN_NAME=DOMAIN_NAME , BUCKET_NAME=BUCKET_NAME , AWS_DEFAULT_REGION=AWS_DEFAULT_REGION , LOG_BUCKET_NAME=LOG_BUCKET_NAME)
print(distribution_config)`


* Once you have the distribution config file from above , use the below code to create distribution

```
cf_client = boto3.client('cloudfront')
response = cf_client.create_distribution(
DistributionConfig={
}
```
This would take around 30 mins for the deployment to complete. The status of the deployment can be monitored from the console.
Once done make a note of the cloudfront distro url like `d479jm2bixvrmo.cloudfront.net` (CF_DISTRO_URL)

### Create Route53 A-Record and CNAME
* Login to the AWS Console and go to Route53. Click on `Hosted Zone`. If your domain is registered and read to use , click on the domain `yourdomain.com.` Note the HOSTED_ZONE_ID like `Z7FDTJEBTBTZT1`
* Click on `Create Record Set`. We will create 2 record sets both pointing to the cloud front distribution url.
* Here is the config with 2 record sets, replicate this on the console

```
client = boto3.client('route53')
response = client.change_resource_record_sets(
    HostedZoneId=HOSTED_ZONE_ID,
    ChangeBatch={
        'Comment': 'Hugo site',
        'Changes': [
            {
                'Action': 'UPSERT',
                'ResourceRecordSet': {
                    'Name': 'yourdomain.com.',
                    'Type': 'A',
                    'AliasTarget': {
                        'HostedZoneId': HOSTED_ZONE_ID,
                        'DNSName': CF_DISTRO_URL + '.',
                        'EvaluateTargetHealth': False
                    }
                }
            },
             {
                'Action': 'UPSERT',
                'ResourceRecordSet': {
                    'Name': 'www.yourdomain.com.',
                    'Type': 'CNAME',
                    'TTL':300,
                    'ResourceRecords': [
                        {
                            'Value': CF_DISTRO_URL
                        },
                    ]
                }
            }
        ]
    }
)
```

## Part 3 , Useful CLI Commands 
__________________________________

### CF Invalidations , invalidate all pages
`aws cloudfront create-invalidation --distribution-id <your cf dist id> --paths "/*"`

[More about invalidations ...](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html)


### S3 clear bucket commands
* aws s3 rm s3://bucket-name --recursive
* aws s3 rm s3://bucket-name/doc --recursive