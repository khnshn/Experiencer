<p align="center">
  <img alt="Experiencer logo" height="200" src="https://experiencer.eu/wp-content/uploads/2022/08/cropped-fit-Experiencer-logos_transparent.png">
</p>

# Experiencer: A Smartwatch-based Context-sensitive Experience Sampling Tool Designed for Researchers and Study Participants

## About the Project

[Experiencer](https://experiencer.eu/) is the outcome of an endeavor to create an ESM solution that benefits both researchers and study participants while leveraging the physiological sensors of commodity-level wearable devices.

Experiencer software has been used in several research studies throughout its evolution. Such studies have been in line with the author's Ph.D. trajectory at the Eindhoven University of Technology (at the future everyday group of the industrial design department, also in collaboration with the human technology interaction group, industrial engineering department, and GGz Centraal). Experiencer is in the development phase and is being altered frequently. However, as we believe in **Openness, Availability, and Security**, we hereby open-source a recent and comparatively stable version of our Tizen smartwatch software, Experiencer, to advocate our belief and support the scientific community. The source code is available under the `src` directory.

## Environment

Experiencer is written in plain JavaScript compatible with Tizen OS v5.5+. The back-end of Experience is built on top of [GameBus](https://devdocs.gamebus.eu/). GameBus facilitates data storage and retrieval as well as user authentication and authorization. We have deployed our software onto Samsung Active 2 smartwatches. We use [Samsung Knox](https://www.samsungknox.com/en) to manage our devices remotely (and on-the-fly).

### GameBus

GameBus is a GDPR-oriented EU-based free health platform offered by academics to academics. Although the GameBus is not open-source (yet), the Experiencer can in principle work with other backends as well. Interested researchers can [contact us](https://experiencer.eu/contact-us/) to access the pre-built version of the Experiencer that is integrated with GameBus along a the step-by-step setup guide to run their experiment with Experiencer.

### _For Developers_

_for an in-depth developer documentation visit [DEVDOCS.md](/DEVDOCS.md)_

Below the essential client-server interactions are explained so that developers can integrate their own back-end. Before storing data in GameBus via `POST` requests following the [GameBus DevDocs](https://devdocs.gamebus.eu/), a smartwatch (_device_) needs to be assigned to a _participant_, _ESM protocol_, and a _treatment group_. Such process is initiated by calling the `{base_url}/tizen/register/study?policy={treatment_group}` where device ID (retrieved by scanning the QR code shown on the main screen of the app) and ESM protocol name are passed as request body and GameBus user's auth token as request header (Fig.1). The aforementioned process can be used to authenticate a participant as well. Alternatively, Fig.2 shows an authentication flow where username and password can be put in manually.

<figure align="center">
  <img src="https://experiencer.eu/wp-content/uploads/2022/09/activity-diagrams-1.png">
  <figcaption>Fig.1 - Experiencer-GameBus interaction for registration and authentication</figcaption>
</figure>
<figure align="center">
  <img src="https://experiencer.eu/wp-content/uploads/2022/09/activity-diagrams-2.png">
  <figcaption>Fig.2 - Experiencer-GameBus interaction for authentication</figcaption>
</figure>

### Samsung Knox

Samsung Knox License enables access to [Knox Configure](https://www.samsungknox.com/en/solutions/it-solutions/knox-configure) where creating profiles and assiging such profiles to watches can be handeled remotely and in real time. Profiles are a conveniet way to install custom apps (e.g., Experiencer) and configure watches. i.e., enable/disable device features, manage network connection, restrict users to change settings, etc.

### Built with

- [Tizen Web API](https://docs.tizen.org/application/web/api/)
- [Tizen Studio](https://developer.tizen.org/development/tizen-studio/download)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

## Case Studies

Examples of consumed configuration files to facilitate research execution in some of our research studies are accessible under the `examples/configuration` directory.
The unique identifiers and various string literals within the configurations that correspond to unpublished research are obfuscated to preserve the authors' rights. Meanwhile, the configuration structure is intact, as consumed in the real study.

# Affiliations

- [GameBus](http://blog.gamebus.eu/)

- [Eindhoven University of Technology](https://www.tue.nl/en/)

- [Eindhoven Artificial Intelligence Systems Institute](https://www.tue.nl/en/research/institutes/eindhoven-artificial-intelligence-systems-institute/)

# About the Author

Alireza Khanshan is a PhD candidate in the Future Everyday group of the industrial design department at Eindhoven University of technology. He holds a bachelor’s degree in computer software engineering and a master’s degree in the same field with a data science minor. His expertise lies in software engineering and data mining. His current research focus is on the application of data mining and software engineering techniques in software systems involving human participants to enhance the experience of the users and the usability of the software.

- Author's [homepage](https://khanshan.com/)
- For more information about the sofware visit [The Official Experiencer website](https://experiencer.eu/).

## Publications

Khanshan, A., Van Gorp, P., Markopoulos, P. (2023). Experiencer: An Open-Source Context-Sensitive Wearable Experience Sampling Tool. In: Tsanas, A., Triantafyllidis, A. (eds) Pervasive Computing Technologies for Healthcare. PH 2022. Lecture Notes of the Institute for Computer Sciences, Social Informatics and Telecommunications Engineering, vol 488. Springer, Cham. https://doi.org/10.1007/978-3-031-34586-9_21
