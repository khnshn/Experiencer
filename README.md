<p align="center">
  <img alt="Experiencer logo" height="200" src="https://experiencer.eu/wp-content/uploads/2022/08/cropped-fit-Experiencer-logos_transparent.png">
</p>

# Experiencer: A Smartwatch-based Context-sensitive Experience Sampling Tool Designed for Researchers and Study Participants

## About the Project
[Experiencer](https://experiencer.eu/) is the outcome of an endeavor to create an ESM solution that benefits both researchers and study participants while leveraging the physiological sensors of commodity-level wearable devices.

Experiencer software has been used in several research studies throughout its evolution. Such studies have been in line with the author's Ph.D. trajectory at the Eindhoven University of Technology (at the future everyday group of the industrial design department, also in collaboration with the human technology interaction group, industrial engineering department, and GGz Centraal). Experiencer is in the development phase and is being altered frequently. However, as we believe in **Openness, Availability, and Security**, we hereby open-source a recent and comparatively stable version of our Tizen smartwatch software, Experiencer, to advocate our blief and support the scientific community. The source code is available under the `src` directory.

## Environment

Experiencer is written in plain JavaScript compatible with Tizen OS v5.5+. The back-end of Experience is built on top of [GameBus](https://devdocs.gamebus.eu/). GameBus facilitates data storage and retrieval as well as user authentican and authorization. We have deployed our software onto Samsung Active 2 smartwatches. We use [Samsung Knox](https://www.samsungknox.com/en) to manage our devices remotely (and on-the-fly).

### GameBus

GameBus is an GDPR-oriented EU-based free health platform offered by academics to academics. Althoug the GameBus is not open-source (yet), the Experiencer can in principle work with other backends as well.

<figure align="center">
  <img src="https://experiencer.eu/wp-content/uploads/2022/09/activity-diagrams-1.png">
  <figcaption>Fig.1 - Experiencer-GameBus interaction for authentication scenario 1</figcaption>
</figure>
<figure align="center">
  <img src="https://experiencer.eu/wp-content/uploads/2022/09/activity-diagrams-2.png">
  <figcaption>Fig.2 - Experiencer-GameBus interaction for authentication scenario 2</figcaption>
</figure>

### Samsung Knox

Samsung Knox License enables access to Knox Configure where creating profiles and assiging such profiles to watches can be handeled remotely and real time. Profiles are a conveniet way to install custom apps (e.g., Experiencer) and configure watches. e.g., enable/disable device features, registering specific networks, restricting users to change settings, etc.

### Built with

* [Tizen Web API](https://docs.tizen.org/application/web/api/)
* [Tizen Studio](https://developer.tizen.org/development/tizen-studio/download)
* [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

## Case Studies
Examples of consumed configuration files to facilitate research execution in some of the research studies are accessible under the `examples/configuration` directory.
The unique identifiers and various string literals within the configurations that correspond to unpublished research are obfuscated to preserve the author's rights. Meanwhile, the configuration structure is intact, as consumed in the real study.



# Affiliations
* [GameBus](http://blog.gamebus.eu/)

* [Eindhoven University of Technology](https://www.tue.nl/en/)

* [Eindhoven Artificial Intelligence Systems Institute](https://www.tue.nl/en/research/institutes/eindhoven-artificial-intelligence-systems-institute/)



# About the Author
Alireza Khanshan is a PhD candidate in the Future Everyday group of the industrial design department at Eindhoven University of technology. He holds a bachelor’s degree in computer software engineering and a master’s degree in the same field with a data science minor. His expertise lies in software engineering and data mining. His current research focus is on the application of data mining and software engineering techniques in software systems involving human participants to enhance the experience of the users and the usability of the software.

* Author's [homepage](https://khanshan.com/)
* For more information about the sofware visit [The Official Experiencer website](https://experiencer.eu/).