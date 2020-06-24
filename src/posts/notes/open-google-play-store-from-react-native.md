---
uid: 'PB-N-3'
title: 'Open google play store from react native app'
date: 2020-06-24T01:53:41.410Z
path: /notes/open-google-play-store-from-react-native/
excerpt: "User rating for our react native app is very important factor for us to keep maintaining the app and make it a success. Let's learn how we can take our user to google play store from our react native app here."
image: ../../images/notes/open-google-play-store-from-react-native.webp
categories: [notes]
tags: [react native, mobile development]
comments: true
featured: true
toc: true
canonical: true
canonical_url: 'https://thedevpost.com/blog/extract-key-or-value-from-hash-in-ror/'
---

User ratings are very valuable to business as they play a crucial part in people's purchasing decisions; be it restaurants, movie tickets or in the current context, our react native app. You must have seen prompts when you are surfing through any android app or playing games, that ask you to rate the app in google play store.

Are you wondering how you can emulate same behavior in our react native app that is live and has real users who you always wanted to cater? Getting user ratings or let's say taking our user to google play store is possible in react native through the use of <a href="https://reactnative.dev/docs/linking" target="_blank">Linking</a>. There are also many packages that we can use who will have Linking under the hood, but today we will be trying very simple solution without using any packages.

## Simple Example

If you don't have time to go through whole blog, this is what you will have to add to your code on button click asking to rate your app in google play store:

```js
Linking.openURL('market://details?id=com.whatsapp');
```

## Detailed Example

In this example, we will create a button and add a method that can take our user to google play store.

```js
# components/rateApp/rateAppButton.js
import React from 'react';
import { View, Text, Linking, TouchableHighlight, StyleSheet } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const styles = StyleSheet.create({
  rateUsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00875F',
    padding: 15,
    justifyContent: 'flex-start',
  },

  rateUsText: {
    fontSize: 18,
    marginLeft: 10,
    color: colors.WHITE,
  },
});

const RateAppButton = () => {
  const openPlayStore = () => {
    // it's a good idea to add this in .env file and use it from there
    const GOOGLE_PACKAGE_NAME = 'com.whatsapp';

    Linking.openURL(`market://details?id=${GOOGLE_PACKAGE_NAME}`);
  };

  return (
    <TouchableHighlight onPress={openPlayStore}>
      <View style={styles.rateUsButton}>
        <FontAwesome5
          name="google-play"
          size={20}
          color="#ffffff"
        />
        <Text style={styles.rateUsText}>Rate us on google play</Text>
      </View>
    </TouchableHighlight>
  );
};

export default RateAppButton;
```

Are you using some package to take your user to play store? Let us know in the comments below if you have other ideas for the same problem.

**References:** <a href="https://reactnativeforyou.com/how-to-open-google-play-store-from-your-react-native-app/" target="_blank">How to Open Google Play Store from your React Native App</a>, <a href="https://aboutreact.com/react-native-rate-this-app-feature/#Android" target="_blank">Ask to Rate Your React Native App on Google</a>

**Image Credits:** Cover Image by <a href="https://pixabay.com/users/200degrees-2051452/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1635207" target="_blank">200 Degrees</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1635207" target="_blank">Pixabay</a>
