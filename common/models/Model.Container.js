
const CONTAINERS_URL = '/api/containers/';
const sharp = require('sharp');
const path = require('path');

module.exports = function(Model) {
  const debug = require('debug')('component:storage:container');
  let app;

  Model.once('attached', (a) => {
    app = a;
    let settings = app.settings;
    let directory = app.dataSources.storage.settings.root;

    /** ******************** REMOTE HOOK ******************** **/
    Model.beforeRemote('upload', function(ctx, unused, next) {
      Model.getContainers((err, instances) => {
        if (err) {
          console.log(err);
          throw err;
        }
        let instance = instances.filter((container) => {
          return container.name === ctx.args.container;
        });
        if (instances.length === 0 || instance.length === 0) {
          Model.createContainer({
            name: ctx.args.container,
          }, (err, instance) => {
            if (err) {
              console.log(err);
              throw err;
            }
          });
        }
        next();
      });
    });

    Model.afterRemote('upload', function(ctx, unused, next) {
      let storageConfig = settings['component-storage'];
      let userId = null;
      if (undefined !== ctx.req.accessToken) {
        userId = ctx.req.accessToken && ctx.req.accessToken.userId;
      }
      var files = ctx.result.result.files.file;
      let stream = null;

      let uploadedFiles = files.map((item, i) => {
        let url = CONTAINERS_URL + item.container + '/download/' + item.name; // eslint-disable-line
        stream = Model.downloadStream(item.container, item.name);
        let thumbnailSizes = storageConfig.thumbnails;
        let parseFile = path.parse(item.name);

        if (item.type.startsWith('image')) {
          thumbnailSizes.forEach((thumbnail) => {
            let newFilename =
              `${parseFile.name}${parseFile.ext}_${thumbnail.width}px_${thumbnail.height}px${parseFile.ext}`; // eslint-disable-line

            let newImage = sharp(path.join(directory, item.container, item.name))
              .resize(thumbnail.width, thumbnail.height);
            if (false === storageConfig.keepAspectRatio) {
              newImage.ignoreAspectRatio();
            } else {
              newImage.max();
            }
            // default to center as provided by sharp
            // else top-left
            if (false === storageConfig.cropCenter) {
              newImage.crop(sharp.gravity.northeast);
            }
            newImage
              .toFormat('png')
              .toFile(path.join(directory, item.container, newFilename));
          });
        }
        // store reference in files model
        return app.models.files.create({
          name: item.name,
          originalName: item.name,
          type: item.type,
          container: item.container,
          url: url,
          createdAt: Date.now(),
          createdBy: userId,
        });
        stream.on('error', next);
      });
      stream.on('end', function() {
        // try resizing the file as per the thumbnail configuration
        // sharp(stream)
      });
      Promise.all(uploadedFiles).then(response => {
        ctx.result.result.files = response;

        next();
      }).catch(err => {console.log(err)});
    }); // works
  });
};
