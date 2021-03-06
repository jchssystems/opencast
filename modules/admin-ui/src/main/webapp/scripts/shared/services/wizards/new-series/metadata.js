/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 *
 * The Apereo Foundation licenses this file to you under the Educational
 * Community License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of the License
 * at:
 *
 *   http://opensource.org/licenses/ecl2.txt
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 */
'use strict';

angular.module('adminNg.services')
.factory('NewSeriesMetadata', ['NewSeriesMetadataResource', function (NewSeriesMetadataResource) {
    var Metadata = function () {
        var me = this, mainMetadataName = 'dublincore/series', i;

        this.requiredMetadata = {};

        // As soon as the required metadata fields arrive from the backend,
        // we check which are mandatory.
        // This information will be needed in ordert to tell if we can move
        // on to the next page of the wizard.
        this.findRequiredMetadata = function (data) {
            var mainData = data[mainMetadataName];
            me.ud[mainMetadataName] = mainData;
            if (mainData && mainData.fields) {
                for (i = 0; i < mainData.fields.length; i++) {
                    mainData.fields[i].tabindex = i + 1; // just hooking the tab index up here, as this is already running through all elements
                    if (mainData.fields[i].required) {
                        me.requiredMetadata[mainData.fields[i].id] = false;
                        if (mainData.fields[i].type === 'boolean') {
                            // set all boolean fields to false by default
                            mainData.fields[i].value = false;
                            me.requiredMetadata[mainData.fields[i].id] = true;
                        }
                    }
                }
            }
        };

        // Checks if the current state of this wizard is valid and we are
        // ready to move on.
        this.isValid = function () {
            var result = true;
            //FIXME: The angular validation should rather be used,
            // unfortunately it didn't work in this context.
            angular.forEach(me.requiredMetadata, function (item) {
                if (item === false) {
                    result = false;
                }
            });
            return result;
        };

        this.save = function (scope) {
            //FIXME: This should be nicer, rather propagate the id and values
            //instead of looking for them in the parent scope.
            var params = scope.$parent.params,
                fieldId = params.id,
                value = params.value;

            if (params.collection) {
                if (angular.isArray(value)) {
                    var presentableValue = '';

                    angular.forEach(value, function (item, index) {
                        presentableValue += item;
                        if ((index + 1) < value.length) {
                            presentableValue += ', ';
                        }
                    });

                    params.presentableValue = presentableValue;
                } else {
                    params.presentableValue = params.collection[value];
                }
            } else {
                params.presentableValue = value;
            }

            me.ud[mainMetadataName].fields[fieldId] = params;

            if (!angular.isUndefined(me.requiredMetadata[fieldId])) {
                if (angular.isDefined(value) && value.length > 0) {
                    // we have received a required value
                    me.requiredMetadata[fieldId] = true;
                } else {
                    // the user has deleted the value
                    me.requiredMetadata[fieldId] = false;
                }
            }
        };

        this.reset = function () {
            me.ud = {};
            me.metadata = NewSeriesMetadataResource.get(me.findRequiredMetadata);
        };

        this.getUserEntries = function () {
            if (angular.isDefined(me.ud[mainMetadataName])) {
                return me.ud[mainMetadataName].fields;
            } else {
                return {};
            }
        };

        this.reset();
    };

    return new Metadata();
}]);
