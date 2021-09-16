Figma.Parser = function(){
    this.fileKey;
    this.baseUrl = 'https://api.figma.com';

    this.react = new Figma.Component();
    
    this.output = [];

    this.client = axios.create({
        baseURL: `https://api.figma.com/v1/`,
        headers: {
            "X-Figma-Token": process.env.TOKEN,
        },
    })

    this.getDocument = async function (){
        return this.client
            .get('files/'+ this.fileKey)
            .then((data) => {
                return data.data.document;
            })
            .catch((error) => {
                return error.data.status;
            })
    }

    this.parse = async function (fileId){
        this.fileKey = fileId;
        var document = await this.getDocument();
        //console.log(document);
		await this.parseTree(document.children, "");
		return this.output;
    }

    this.parseTree = function(pages, name){
        console.log(pages);
        for (var i = 0; i < pages.length; i++) {
			var page = pages[i];


			if (page["children"]) {
				this.parseTree(page["children"], page.name);
			}

			var layer = page["children"] ? page["children"][0] : page;

            this.output.push({
                name : page.name,
                parent : name
            });
        }
        /*
        this.output = {
            name : pages[0].name,
            backgroundColor : pages[0].backgroundColor[0],
            degree: pages[0].children.length,
            children1 : pages[0].children[0]
        }   
        */
        return this.output;
    }
}