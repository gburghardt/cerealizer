describe("Cerealizer", function() {

	describe("QueryString", function() {

		beforeEach(function() {
			this.serializer = new Cerealizer.QueryString();
		});

		describe("test", function() {

			it("returns true for simple query strings", function() {
				expect(this.serializer.test("foo=bar&x=10")).toBe(true);
			});

			it("returns true for complex query strings", function() {
				expect(this.serializer.test("blog[title]=Test&blog[id]=123&univers.solar_system.earth=Test")).toBe(true);
			});

			it("returns true for query strings with a single parameter", function() {
				expect(this.serializer.test("foo=bar")).toBe(true);
			});

			it("returns false for query string params missing a value", function() {
				expect(this.serializer.test("foo=")).toBe(false);
			});

			it("returns true if at least one good param exists", function() {
				expect(this.serializer.test("foo=&x=10")).toBe(true);
			});

			it("returns false if it only contains a question mark", function() {
				expect(this.serializer.test("?")).toBe(false);
			});

			it("returns false if it contains no params", function() {
				expect(this.serializer.test("foo")).toBe(false);
			});

		});

		describe("_isValid", function() {

			it("returns false for null values", function() {
				expect(this.serializer._isValid(null)).toBe(false);
			});

			it("returns false for undefined values", function() {
				expect(this.serializer._isValid(undefined)).toBe(false);
			});

			it("returns false for NaN values", function() {
				expect(this.serializer._isValid(NaN)).toBe(false);
			});

			it("returns true for string values", function() {
				expect(this.serializer._isValid("testing")).toBe(true);
			});

			it("returns true for number values", function() {
				expect(this.serializer._isValid(268)).toBe(true);
			});

			it("returns true for boolean values", function() {
				expect(this.serializer._isValid(true)).toBe(true);
				expect(this.serializer._isValid(false)).toBe(true);
			});

			it("returns false for objects", function() {
				expect(this.serializer._isValid({})).toBe(false);
			});

			it("returns false for arrays", function() {
				expect(this.serializer._isValid([])).toBe(false);
			});

			it("returns false for functions", function() {
				expect(this.serializer._isValid(function() {})).toBe(false);
			});

		});

		describe("_convert", function() {

			it("converts integers to numbers", function() {
				expect(this.serializer._convert("1")).toBe(1);
				expect(this.serializer._convert("-1")).toBe(-1);
				expect(this.serializer._convert("+1")).toBe(1);
				expect(this.serializer._convert("35")).toBe(35);
				expect(this.serializer._convert("005")).toBe(5);
			});

			it("converts floats to numbers", function() {
				expect(this.serializer._convert("1.0")).toBe(1.0);
				expect(this.serializer._convert(".09")).toBe(0.09);
				expect(this.serializer._convert("0.09")).toBe(0.09);

				expect(this.serializer._convert("-1.0")).toBe(-1.0);
				expect(this.serializer._convert("-.09")).toBe(-0.09);
				expect(this.serializer._convert("-0.09")).toBe(-0.09);

				expect(this.serializer._convert("+1.0")).toBe(+1.0);
				expect(this.serializer._convert("+.09")).toBe(+0.09);
				expect(this.serializer._convert("+0.09")).toBe(+0.09);
			});

			it("converts 'NaN' to a NaN value", function() {
				expect(isNaN(this.serializer._convert("NaN"))).toBe(true);
			});

			it("converts 'true' to true", function() {
				expect(this.serializer._convert("true")).toBe(true);
			});

			it("converts 'false' to false", function() {
				expect(this.serializer._convert("false")).toBe(false);
			});

			it("keeps the string 'null'", function() {
				expect(this.serializer._convert("null")).toBe("null");
			});

			it("returns a string for malformed numbers", function() {
				expect(this.serializer._convert("-..8")).toBe("-..8");
				expect(this.serializer._convert("--8")).toBe("--8");
				expect(this.serializer._convert("1.0.1")).toBe("1.0.1");
			});

		});

		describe("deserialize", function() {

			it("converts number strings to numbers", function() {
				var qs = "x=10&y=32.5&z=NaN&price=$10.99";
				var result = this.serializer.deserialize(qs);

				expect(result.x).toBe(10);
				expect(result.y).toBe(32.5);
				expect(result.hasOwnProperty("z")).toBe(false);
				expect(typeof result.price).toBe("string");
				expect(result.price).toBe("$10.99");
			});

			it("keeps the string 'null' as the string 'null'", function() {
				var qs = "foo=null";
				var result = this.serializer.deserialize(qs);

				expect(result.foo).toBe("null");
			});

			it("converts 'true' to boolean true and 'false' to boolean false", function() {
				var qs = "available=true&in_store=false&online=False";
				var result = this.serializer.deserialize(qs);

				expect(result.available).toBe(true);
				expect(result.in_store).toBe(false);
				expect(result.online).toBe("False");
			});

			it("returns an object of keys and values", function() {
				var qs = [
					"x=10",
					"y=42",
					"title=Testing"
				].join("&");

				var result = this.serializer.deserialize(qs);

				expect(result).toEqual({
					x: 10,
					y: 42,
					title: "Testing"
				});
			});

			it("strips the ? from in front of the query string", function() {
				var qs = "?title=Testing&body=Test";
				var result = this.serializer.deserialize(qs);

				expect(result.title).toBe("Testing");
				expect(result.body).toBe("Test");
			});

			it("decodes the keys and values", function() {
				var key = "weird keys!";
				var value = "Complex, and full of (special) chars.";
				var qs = escape(key) + "=" + escape(value);
				var result = this.serializer.deserialize(qs);

				expect(result.hasOwnProperty(key)).toBe(true);
				expect(result[key]).toBe(value);
			});

			it("omits keys with no value", function() {
				var qs = "title=Testing&body=";
				var result = this.serializer.deserialize(qs);

				expect(result.hasOwnProperty("title")).toBe(true);
				expect(result.hasOwnProperty("body")).toBe(false);
				expect(result.body).toBe(undefined);
			});

			it("creates an array of values from duplicate keys", function() {
				var qs = "test=1&test=2";
				var result = this.serializer.deserialize(qs);

				expect(result.test instanceof Array).toBe(true);
				expect(result.test).toEqual([1, 2]);
			});

			it("creates an array of values from a single key with comma separated values", function() {
				var qs = "test=a,b,c";
				var result = this.serializer.deserialize(qs);

				expect(result.test).toEqual(["a", "b", "c"]);
			});

			it("merges array values when multiple keys with comma separate values are encountered", function() {
				var qs = "test=a,b&test=c,d";
				var result = this.serializer.deserialize(qs);

				expect(result.test).toEqual(["a", "b", "c", "d"]);
			});

			it("throws an error with empty array notation", function() {
				var qs = "letters[]=a";
				var serializer = this.serializer;

				expect(function() {
					serializer.deserialize(qs);
				}).toThrow(new Error("Invalid key detected - Empty array notation is not supported."));
			});

			describe("with nested keys", function() {

				describe("using hash notation", function() {

					it("returns a nested object", function() {
						var qs = "blog[title]=Test&blog[id]=10";
						var result = this.serializer.deserialize(qs);

						expect(result).toEqual({
							blog: {
								title: "Test",
								id: 10
							}
						});
					});

					it("returns a nested object multiple levels deep", function() {
						var qs = [
							"universe[solar_system][earth][hemisphere][name]=Southern",
							"universe[solar_system][earth][hemisphere][country][name]=Brazil"
						].join("&");
						var result = this.serializer.deserialize(qs);

						expect(result).toEqual({
							universe: {
								solar_system: {
									earth: {
										hemisphere: {
											name: "Southern",
											country: {
												name: "Brazil"
											}
										}
									}
								}
							}
						});
					});

				});

				describe("using dot notation", function() {

					it("returns a nested object", function() {
						var qs = "blog.title=Test&blog.id=10";
						var result = this.serializer.deserialize(qs);

						expect(result).toEqual({
							blog: {
								title: "Test",
								id: 10
							}
						});
					});

					it("returns a nested object multiple levels deep", function() {
						var qs = [
							"universe.solar_system.earth.hemisphere.name=Southern",
							"universe.solar_system.earth.hemisphere.country.name=Brazil",
							"your_face.was=Deeply%20Nested"
						].join("&");
						var result = this.serializer.deserialize(qs);

						expect(result).toEqual({
							universe: {
								solar_system: {
									earth: {
										hemisphere: {
											name: "Southern",
											country: {
												name: "Brazil"
											}
										}
									}
								}
							},
							your_face: {
								was: "Deeply Nested"
							}
						});
					});

				});

				describe("using mixed dot and hash notation", function() {

					it("returns a nested object multiple levels deep", function() {
						var qs = [
							"universe[solar_system].earth.hemisphere[name]=Southern",
							"universe[solar_system].earth.hemisphere[country].name=Brazil"
						].join("&");
						var result = this.serializer.deserialize(qs);

						expect(result).toEqual({
							universe: {
								solar_system: {
									earth: {
										hemisphere: {
											name: "Southern",
											country: {
												name: "Brazil"
											}
										}
									}
								}
							}
						});
					});

				});

			});

		});

		describe("serialize", function() {

			xit("converts a simple object to key-value pairs", function() {
				var data = {
					title: "Testing",
					price: 12.99,
					description: "Just testing"
				};

				var expected = [
					"title=Testing",
					"price=12.99",
					"description=Just%20testing"
				].join("&");

				var result = this.serializer.serialize(data);

				expect(result).toBe(expected);
			});

			xit("excludes null values", function() {
				var data = { title: null };
				var expected = "";
				var result = this.serializer.serialize(data);

				expect(result).toBe(expected);
			});

			xit("excludes undefined values", function() {
				var data = { title: undefined };
				var expected = "";
				var result = this.serializer.serialize(data);

				expect(result).toBe(expected);
			});

			xit("excludes NaN values", function() {
				var data = { price: NaN };
				var expected = "";
				var result = this.serializer.serialize(data);

				expect(result).toBe(expected);
			});

			describe("with a nested object", function() {

				describe("configured to use hash notation", function() {
				});

				describe("configured to use dot notation", function() {
				});

			});

		});

	});

});
