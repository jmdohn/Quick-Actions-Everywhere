# Quick-Actions-Everywhere

Table of contents:

* [Background](#Background)
* [Supports](#Supports)
* [Installation](#Installation)
* [Parameters](#Parameters)
* [FAQ](#FAQ)
* [Shout outs](#Shout-outs)

Background
==========
This is a library for pushing quick actions everywhere in Salesforce (except for the global action bar, because, well, they are already everywhere!).

Because I've migrated to lightning and because your action bar can quickly get overloaded, I wanted to find a solution and keep context for end users to operate within their related lists.  Given that Lightning Out allows for buttons to exist in classic and Lightning, this was the solution for me.  I know I'm not alone and there is an idea with a sizable amount of points to it here:

* [Allow quick action on related lists - 14,150+](https://success.salesforce.com/ideaView?id=0873A0000003TXFQA2)
* [Allow Custom Actions to display as Buttons on Cases (Feed-Based Layout) - 2,700+](https://success.salesforce.com/ideaView?id=0873A000000lKBBQA2)
* [Quick Action Should Redirect to Created Record - 2,250+ points](https://success.salesforce.com/ideaView?id=0873A000000lFe8QAE)
* [Support ability to open a custom quick action from a custom Lightning component - 1,450+](https://success.salesforce.com/ideaView?id=0873A000000CPOHQA4)

We have all the tools to succeed, we just have to put the pieces together in the right way.  Hopefully, this repo is a start at deceiphering that puzzle.

Supports
========
1. Related List Quick Actions
2. Quick Actions in Lightning Pages
3. Quick Actions in Community Record Pages and Pages
4. Flows in related lists or buttons with redirection
5. Quick Actions in Buttons (as opposed to feed)
6. Classic, Mobile and of course, Lightning Experience

Pre-Installation
===============

1. Pull down the repository to your machine.
2. Use sfdx force:source:deploy -u [your org alias] force-app\main

Note: This app does require a platform cache.  This is used to retrieve various sets of metadata to improve performance.  If you have an existing platform cache you would like to utilize, you will have to modify the code.  As always, test in a sandbox!

# Post-deployment (You must perform these or the app will not work):
1. Navigate to Auth Providers and create the qae_REST_API auth provider. Use values:
	* Provider Type: Salesforce
	* Name: qae_REST_API
	* URL Suffix: qae_REST_API

	[Auth Provider](../master/images/AuthProvider.JPG?raw=true)
2. Navigate to app manager and create a new connected app.  Use values:
	* App Name: qae_REST_API
	* Email: Your Email
	* Enable OAuth Settings: Checked
	* Callback URL: https:test.com (we'll change this after save)
	* Selected Oauth Scopes: Access and manage your data (api), Perform requests on your behalf at any time (refresh_token, offline_access)
	* Require Secret for Web Server Flow: checked

	[Connected App](../master/images/ConnectedApp.JPG?raw=true)
3. Copy the Consumer Key and the Consumer Secret from the connected app into the qae_REST_API auth provider screen.

	[Connected App Key and Secret](../master/images/connectedApp2.PNG?raw=true)
4. Save the auth provider.
5. Get the callback URL from the Auth Provider and copy to the callback url of the connected application.
6. Ensure that the Named Credential qae REST API has the correct instance url.  You will need to click on "Edit" on the named credential and authenticate as the named principal user that should run the REST callout - this means all callouts will run as this user.  It is highly recommended that this is a service user to monitor ussage.

	[Named Credential](../master/images/Named_Credential.JPG?raw=true)

Once you've got this in your org, make sure that you extend access to all profiles that you would like to access the quick actions the quickActionsEverywhere visualforce page and controller.

Parameters
==========

| Parameter                      | Description                                                                                                                                                                                                                  |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| relatedId                      | Id of the record that is related to the quick action - If in community context, you must pass in {!recordId} in the component for a record page. |
| relatedField                   | The field which is related to the quick action|
| action                         | API Name of the quick action.  Example: Contact.Create_Contact.  For Global actions, only the API name need be entered, ex NewTask|
| title                          | Display title of the quick action.|
| redirectAction                 | How to redirect to records. Valid values are "parent", "child". By default user is redirected to the parent. <br> Note that parent is not available for when using in a lightning page, as you would already be on the parent record.<br> Does not apply to flow actions.|
| flowDevName			         | Flow developer name. This is only exposed for button actions.   If you want to use a flow in lightning pages, use the standard flow component. Flows will redirect to the recordId variable. You may update the recordId variable via assignment to choose where to redirect based on use case.|
| type                           | Type of action - either "relatedList" or "quickAction".|
| fields                         | If type is "relatedList" specify the fields to display as columns.|

FAQ
===

Q. We have to set up a Connected App, Auth. Proivder and a Named Credential to connect to the REST API.  Why do we need to do this?

A. In order to get the search layouts, the tab icon information for polymorphic relationship fields (think WhoId and WhatId) and default field values, this needs to be connected.  This will give you a seemless search experience.
https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/apex_api_calls.htm#apex_api_calls
```By security policy, sessions created by Lightning components aren’t enabled for API access. This prevents even your Apex code from making API calls to Salesforce. Using a named credential for specific API calls allows you to carefully and selectively bypass this security restriction. The restrictions on API-enabled sessions aren’t accidental. Carefully review any code that uses a named credential to ensure you’re not creating a vulnerability.```

I take application security seriously.  Therefore, you will notice that the code does not blanketly allow for calls to the REST API.  All API Calls are parameterized and those parameters cannot be circumvented to make a call that was not intended.

Q. Do you enforce object level & field level security?

A. Yes, these are enforced via schema describes and occur both before presenting fields to the user and before saving records to the Salesforce database, therefore not allowing for unintended data to be saved from the client should any malicious attempts be made to save to the database.

Q. Since you're calling out to the REST API, how does your app reduce API Calls?

A. Great question! A custom cache is used for the application.  If the variables needed for the app / action already exist in cache, since it is relatively static data (compact layouts, tab icons and their colors, etc), the code will not make another API call.

For default values, a REST callout is made every time and the default values are calculated server side. Making a default value parser client side would have been time prohibitive and would open the possibility of deviating from calculations server side.

Q. When on a task or event, I noticed that a recently added object is not appearing in the list or if I add a new field or change the order of fields in my search layouts, the fields are not appearing when I search.  How do I fix that?

A. Platform cache is being utilitzed.  The time that the cache will clear for the org is every 24 hours.  Since object changes don't happen often, this is used to minimize REST callouts and to keep the application performant.  If you want to reset the cache and have the callout performed on the page, simply go to qaeRestCache platform cache partition and click on the "Clear Cache" button.

Q. The component does not appear to be working for xyz use case or I have a great idea!  Where do I file this?

A. Please head over to the issues section where I can file away enhancement requests or bugs.  This is open source so if you happen to find a solve, please feel free to issue a pull request.  Don't forget to search first. ;-)

Shout-outs
==========

Special thanks to those that had feedback on quick action functionality that addressed: "If quick actions could do ____________, I would like them more."  Your help in brainstorming some common things that would be great for quick actions helped this repo be what it is today.

* Elizabeth Davidson - @eliz_beth
* Mary Tagler - @yramtSFDC
* Jodie Miners - @jodiem
* Corey Snow - @corey_snow
* Gorav Seth - @goravseth
* Mark Ross - @markross__c
* Cheryl Feldman - @CherFeldman
