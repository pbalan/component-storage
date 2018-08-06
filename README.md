# component-storage

This loopback storage component is an extension to [loopback-component-storage](https://www.npmjs.com/package/loopback-component-storage)
to support security features related to file uploads described below.

### Enforce Security

As per this [article](https://www.owasp.org/index.php/Unrestricted_File_Upload),
when an image is uploaded to the server it is subject to cross site vector
attacks, therefore we must recreate images on the server before saving them.

This component uses 3rd party image processing library
[Sharp](https://www.github.com/lovell/sharp) for recreating images which is
licensed under [Apache 2.0 License](http://spdx.org/licenses/Apache-2.0.html).

## Developing and Contributing

I'd love to get contributions from you! For a quick guide to getting your
system setup for developing, take a look at our [Quickstart
Guide](https://github.com/pbalan/component-storage/blob/master/docs/quickstart.md).
Once you are up and running, take a look at the [Contribution Documents](https://github.com/pbalan/component-storage/blob/master/CONTRIBUTING.md)
to see how to get your changes merged in.

## License

See [LICENSE](https://github.com/pbalan/component-storage/blob/master/LICENSE)
file.

### Todo
- Tests for different configuration options.
