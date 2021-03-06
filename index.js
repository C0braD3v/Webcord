const https = require('https')
const url = require('url')

function err(error) {
	error = error.stack.split('\n')
	error.splice(1, 1)
	error = error.join('\n')
	console.log('\x1b[31m', error, '\x1b[0m')
	process.exit(1)
}


/**
 * @typedef {object} Webcord
 */
class Webcord {
	#titles
	#descriptions
	#urls
	#timestamps
	#colors
	#footers
	#images
	#thumbnails
	#authors
	#fields
	#url
	#embedTotal
	#embedIndex
	#msg
	/**
	 * @param {object} options - Webcord options
	 * ```js
	 * const webcord = require('webcord')
	 * new webcord({
	 *      url: "https://discordapp.com/api/webhooks/817645388345186120/7FT_nELazMwK3iY7X8yXdjIsmdoS07rXIONszaT2qnv3lJgRIkqGGLfCnzihej",
	 *      name: "Webcord",
	 *      avatar: "https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png"
	 * })
	 * ```
	 * @param {string} options.url - Discord webhook link
	 * @param {?string} [options.name] - Webhook display name
	 * @param {?string} [options.avatar] - Webhook avatar image
	 * @param {boolean} [options.tts] - Should webhook use tts
	 * @param {boolean} [options.mentions] - Can the webhook mention users/bots
	 */
	constructor(options = {
		url,
		name: null,
		avatar: null,
		tts: false,
		mentions: false
	}) {
		if (!options.url) {
			err(new Error('The webhook url is missing'))
		}
		this.#titles = ['']
		this.#descriptions = ['']
		this.#urls = ['']
		this.#timestamps = ['']
		this.#colors = ['']
		this.#footers = [{}]
		this.#images = ['']
		this.#thumbnails = ['']
		this.#authors = [{}]
		this.#fields = [[]]
		this.#url = options.url
		this.#embedTotal = 0
		this.#embedIndex = 0
		this.#msg = {
			username: options.name,
			avatar_url: options.avatar,
			tts: options.tts,
			allowed_mentions: options.mentions,
			embeds: []
		}
	}

	/**
	 * @description Increments to the next embed.
	 * @returns {Webcord} this
	 */
	inc() {
		if (this.#embedTotal <= this.#embedIndex) {
			this.#embedTotal++
			this.#titles.push('')
			this.#descriptions.push('')
			this.#urls.push('')
			this.#timestamps.push('')
			this.#colors.push('')
			this.#footers.push({})
			this.#images.push('')
			this.#thumbnails.push('')
			this.#authors.push({})
			this.#fields.push([])
		}
		this.#embedIndex++
		return this
	}

	/**
	 * @description Decrement to the previous embed.
	 * @returns {Webcord} this
	 */
	dec() {
		this.#embedIndex--
		return this
	}

	/**
	 * @description Adds a field to the embed (max 25).
	 * @param {string} name The name of this field
	 * @param {string} value The value of this field
	 * @param {boolean} [inline=false] If this field will be displayed inline
	 * @returns {Webcord} this
	 */
	addField(name, value, inline = false) {
		if (name.length > 256) return err(new Error('The name cannot be longer than 256 characters located inside .addField()'))
		if (value.length > 1024) return err(new Error('The value cannot be longer than 1024 characters located inside .addField()'))
		this.addFields({
			name,
			value,
			inline
		})
		return this
	}
	/**
	 * @description Adds one or more fields to the embed (max 25).
	 * @param {...object} fields Field object
	 * ```js
	 * .addFields({
	 * 		name: "Title",
	 * 		value: "Some text",
	 * 		inline: true
	 * },
	 * {
	 * 		name: "Another title",
	 * 		value: "Some more text",
	 * 		inline: false
	 * })
	 * ```
	 * @returns {Webcord} this
	 */
	addFields(...fields) {
		if (typeof this.#fields[this.#embedIndex] === 'undefined') this.#fields.push([])
		this.#fields[this.#embedIndex].push(...fields)
		return this
	}

	/**
	 * @description Sets a title on the embed.
	 * @param {string} title The title of the embed
	 * @returns {Webcord} this
	 */
	setTitle(title) {
		if (!title) return err(new Error('A title must be specified as a parameter in .setTitle()'))
		if (title.length > 256) return err(new Error('The title cannot be longer than 256 characters located inside .setTitle()'))
		this.#titles[this.#embedIndex] = title
		return this
	}

	/**
	 * @description Sets a description on the embed.
	 * @param {string} description The description of the embed
	 * @returns {Webcord} this
	 */
	setDescription(description) {
		if (!description) return err(new Error('A description must be specified as a parameter in .setDescription()'))
		if (description.length > 2048) return err(new Error('The description cannot be longer than 256 characters located inside .setDescription()'))
		this.#descriptions[this.#embedIndex] = description
		return this
	}

	/**
	 * @description Sets a url on the embed.
	 * @param {string} url The url of the embed
	 * @returns {Webcord} this
	 */
	setURL(url) {
		if (!url) return err(new Error('A url must be specified as a parameter in .setURL()'))
		this.#urls[this.#embedIndex] = url
		return this
	}

	/**
	 * @description Sets a timestamp on the embed.
	 * @returns {Webcord} this
	 */
	setTimestamp() {
		this.#timestamps[this.#embedIndex] = new Date()
		return this

	}

	/**
	 * @description Sets a color of the embed.
	 * @param {string|number} [hex] Hex color
	 * @returns {Webcord} this
	 */
	setColor(hex) {
		if (typeof hex === 'number') hex = hex.toString(16)
		hex = String(hex)
		hex = hex.replace(/#/g, '')
		hex = parseInt(hex, 16)
		this.#colors[this.#embedIndex] = hex
		return this
	}

    /**
	 * @description Sets the footer of the embed.
	 * ```js
	 * .setFooter("I'm a footer!", "https://somesite.com/image.png")
	 * ```
	 * @param {string} text - Footer value
	 * @param {?string} [icon] - Footer icon
	 * @returns {Webcord} this
	 */
	setFooter(text, icon) {
		if (!text) return err(new Error('You must specify `text` to send inside .setFooter()'))
		if (text.length > 2048) return err(new Error('The `text` key cannot be longer than 2048 characters located inside .setFooter()'))
		this.#footers[this.#embedIndex] = {
			text: options.text,
			icon_url: options.icon
		}
		return this
	}

	/**
	 * @description Sets the image of the embed.
	 * @param {string} url - Image url
	 * @returns {Webcord} this
	 */
	setImage(url) {
		if (!url) return err(new Error('A url must be specified as a parameter in .setImage()'))
		this.#images[this.#embedIndex] = url
		return this
	}

	/**
	 * @description Sets the thumbnail of the embed.
	 * @param {string} url - Thumbnail url
	 * @returns {Webcord} this
	 */
	setThumbnail(url) {
		if (!url) return err(new Error('A url must be specified as a parameter in .setThumbnail()'))
		this.#thumbnails[this.#embedIndex] = url
		return this

	}

	/**
	 * @description Sets the author of the embed.
	 * @param {object} options - Author options
	 * ```js
	 * .setAuthor({
	 * 		name: "Webcord devs",
	 * 		icon: "https://somesite.com/icon.png",
	 * 		url: "https://discord.com/"
	 * })
	 * ```
	 * @param {string} options.name - Author value
	 * @param {?string} [options.icon] - Author icon
	 * @param {?string} [options.url] - Author url
	 * @returns {Webcord} this
	 */
	setAuthor(options = {
		name: null,
		icon: null,
		url: null
	}) {
		if (!options.name) return err(new Error('A `name` key must be specified in the object located inside .setAuthor()'))
		if (options.name.length > 256) return err(new Error('The `name` key cannot be longer than 256 characters located inside .setAuthor()'))
		this.#authors[this.#embedIndex] = {
			name: options.name,
			icon_url: options.icon,
			url: options.url
		}
		return this
	}

	/**
	 * @description Sends webhook.
	 * @param {string} [msg] Optional basic message
	 * @returns {Promise.<Object>} POST request response data
	 */
	send(msg) {
		const webhook = url.parse(this.#url)
		if (msg) this.#msg.content = msg
		let char = 0

		for (let i = 0; i <= this.#embedTotal; i++) {
			this.#msg.embeds[i] = {}
			if (this.#fields[i].length !== 0 ) {
				if (this.#fields[i].length > 25) return err(new Error('You cannot have more than 25 fields in a single embed'))
				this.#msg.embeds[i].fields = this.#fields[i]
				this.#fields[i].forEach((val) => {
					char += val.name.length
					char += val.value.length
				})
			}

			if (this.#titles[i].length !== 0) {
				this.#msg.embeds[i].title = this.#titles[i]
				char += this.#titles[i].length
			}
			if (this.#descriptions[i].length !== 0) {
				this.#msg.embeds[i].description = this.#descriptions[i]
				char += this.#descriptions[i].length
			}
			if (this.#urls[i].length !== 0) this.#msg.embeds[i].url = this.#urls[i]
			if (this.#timestamps[i].length !== 0) this.#msg.embeds[i].timestamp = this.#timestamps[i]
			if (this.#colors[i].length !== 0) this.#msg.embeds[i].color = this.#colors[i]
			if (Object.keys(this.#footers[i]).length !== 0) {
				this.#msg.embeds[i].footer = this.#footers[i]
				char += this.#footers[i].length
			}
			if (this.#images[i].length !== 0) this.#msg.embeds[i].image = {
				url: this.#images[i]
			}
			if (this.#thumbnails[i].length !== 0) this.#msg.embeds[i].thumbnail = {
				url: this.#thumbnails[i]
			}
			if (Object.keys(this.#authors[i]).length !== 0) {
				this.#msg.embeds[i].author = this.#authors[i]
				char += this.#authors[i].name.length
			}
			if (char > 6000) return err(new Error('Title, description, field.name, field.value, footer.text, and author.name cannot exceed a total character length of 6000'))
			char = 0
		}

		this.#msg.embeds = this.#msg.embeds.filter((j) => {
			return Object.keys(j).length !== 0
		})

		const payload = this.#msg
		return new Promise(async function (resolve) {
			const req = https.request({
				hostname: webhook.host,
				path: webhook.pathname,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': JSON.stringify(payload).length
				}
			}, (res) => {
				resolve(res)
			})
			req.write(JSON.stringify(payload))
		})
	}
}

module.exports = Webcord